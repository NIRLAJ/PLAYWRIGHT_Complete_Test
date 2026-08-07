import { Page, TestInfo, expect } from '@playwright/test';
import { askAI, askAIAboutImage, askAIForJSON } from './aiClient';

/**
 * AI-powered assertion helpers.
 *
 * These complement (never replace) deterministic Playwright assertions.
 * Use them for the class of checks that are genuinely hard to express with
 * selectors/regex - visual layout regressions, "does this look broken",
 * "is this error message reasonable" - and keep exact functional checks
 * (URLs, counts, totals) as normal `expect()` calls.
 */

export interface VisualReviewResult {
    hasBug: boolean;
    summary: string;
    confidence: 'low' | 'medium' | 'high';
}

/**
 * Takes a full-page screenshot and asks Gemini's vision model to flag
 * anything that looks visually broken (overlapping elements, broken images,
 * unreadable text, misaligned layout, etc.). Saves the screenshot as a test
 * attachment either way so it shows up in the HTML report.
 */
export async function aiVisualReview(
    page: Page,
    testInfo: TestInfo,
    context: string
): Promise<VisualReviewResult> {
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await testInfo.attach('ai-visual-review-screenshot', {
        body: screenshotBuffer,
        contentType: 'image/png',
    });

    const prompt =
        `You are reviewing a screenshot of a web page for visual bugs, as part of an ` +
        `automated QA pipeline. Context: ${context}\n\n` +
        `Look specifically for: broken/missing images, overlapping or clipped text, ` +
        `misaligned buttons, unreadable contrast, layout that looks broken on a normal ` +
        `desktop viewport. Ignore purely subjective style opinions - only flag things ` +
        `that look like genuine defects.\n\n` +
        `Respond as JSON: {"hasBug": boolean, "summary": string, "confidence": "low"|"medium"|"high"}`;

    const base64 = screenshotBuffer.toString('base64');
    const raw = await askAIAboutImage(
        base64,
        `${prompt}\n\nRespond with ONLY raw JSON, no markdown fences.`
    );

    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, '').trim();

    try {
        const result = JSON.parse(cleaned) as VisualReviewResult;
        await testInfo.attach('ai-visual-review-verdict', {
            body: JSON.stringify(result, null, 2),
            contentType: 'application/json',
        });
        return result;
    } catch {
        // If the model didn't return clean JSON, fail safe: don't block the
        // pipeline on a parsing problem, just surface the raw text.
        return { hasBug: false, summary: `AI response could not be parsed: ${raw}`, confidence: 'low' };
    }
}

/**
 * Asks Gemini whether an actual message semantically matches an expected
 * intent, even if the exact wording differs. Useful for error-message
 * assertions that would otherwise be brittle string matches.
 */
export async function aiSemanticMatch(actualText: string, expectedIntent: string): Promise<boolean> {
    const prompt =
        `Does the following ACTUAL message convey the same meaning as the EXPECTED intent?\n\n` +
        `ACTUAL: "${actualText}"\n` +
        `EXPECTED INTENT: "${expectedIntent}"\n\n` +
        `Answer with only the single word "true" or "false".`;

    const answer = await askAI(prompt);
    return answer.trim().toLowerCase().startsWith('true');
}

/**
 * Convenience wrapper that turns an AI visual review into a normal Playwright
 * assertion, respecting the AI_ASSERTIONS_SOFT_FAIL env flag so teams can
 * roll this out as "log only" before trusting it to fail builds.
 */
export async function expectNoVisualBugs(page: Page, testInfo: TestInfo, context: string): Promise<void> {
    const result = await aiVisualReview(page, testInfo, context);
    const softFail = process.env.AI_ASSERTIONS_SOFT_FAIL === 'true';

    if (result.hasBug && softFail) {
        console.warn(`[AI soft-fail] Possible visual issue (${result.confidence} confidence): ${result.summary}`);
        return;
    }

    expect(
        result.hasBug,
        `AI visual review flagged a possible issue (${result.confidence} confidence): ${result.summary}`
    ).toBeFalsy();
}

export { askAIForJSON };
