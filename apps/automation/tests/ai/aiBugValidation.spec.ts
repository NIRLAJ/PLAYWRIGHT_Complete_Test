import { test, expect } from '../../fixtures/pageFixtures';
import { LoginPage } from '../../pages/LoginPage';
import { expectNoVisualBugs, aiVisualReview, aiSemanticMatch } from '../../utils/aiAssert';

/**
 * AI-powered assertions.
 *
 * These tests use a Gemini vision model (via apps/automation/utils/aiClient.ts)
 * to judge things that are hard to assert deterministically: "does this page
 * look visually broken", "does this error message mean what we expect".
 *
 * They are opt-in: if GEMINI_API_KEY isn't configured, the suite is
 * skipped rather than failing the whole run, so `npm test` still works
 * out of the box without an API key.
 */

const aiKeyConfigured =
    !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here';

test.describe('AI Visual & Semantic Bug Validation', () => {

    test.skip(!aiKeyConfigured, 'GEMINI_API_KEY not configured - skipping AI-assertion tests. See .env.example.');

    test('AI review finds no visual bugs on the standard_user inventory page', async ({ page, loggedInPage }, testInfo) => {
        await expect(page).toHaveURL(/inventory/);

        await expectNoVisualBugs(
            page,
            testInfo,
            'SauceDemo inventory page for the standard_user - expected to render six product ' +
            'cards with images, names, prices and "Add to cart" buttons, cleanly laid out.'
        );
    });

    test('AI review flags the broken product images for problem_user', async ({ page }, testInfo) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigate('/');
        await loginPage.login('problem_user', process.env.APP_PASSWORD!);
        await expect(page).toHaveURL(/inventory/);

        const result = await aiVisualReview(
            page,
            testInfo,
            'SauceDemo inventory page for problem_user, a demo account that is documented to ' +
            'render broken/identical product images.'
        );

        // For this known-broken user we *expect* the AI to notice something -
        // this is a demonstration that the visual check is actually looking,
        // not just always passing.
        expect(result.hasBug, `Expected AI to flag a visual issue but got: ${result.summary}`).toBeTruthy();
    });

    test('AI confirms the locked-out error message conveys the right meaning', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigate('/');
        await loginPage.login('locked_out_user', process.env.APP_PASSWORD!);

        const actualMessage = await loginPage.getErrorMessage();
        const semanticMatch = await aiSemanticMatch(
            actualMessage,
            'This user account has been blocked or disabled by the site.'
        );

        expect(semanticMatch, `AI did not consider "${actualMessage}" to match the expected intent`).toBeTruthy();
    });

});
