import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Thin wrapper around the Google Gemini SDK, used only by the specs under
 * `apps/automation/tests/ai/`.
 *
 * This is completely separate from the Playwright MCP server (see
 * /opencode.json, /.mcp.json and README.md "AI & MCP integration"). This
 * file lets a *running test* ask Gemini to reason about something it can
 * see (a screenshot, a piece of text) - i.e. "AI as an assertion", not
 * "AI driving the browser".
 *
 * Gemini was chosen here (instead of a paid Claude/OpenAI key) specifically
 * because Google AI Studio offers a genuinely free tier with no credit
 * card required - see https://aistudio.google.com/apikey - which keeps
 * this entire framework runnable at $0.
 */

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            'GEMINI_API_KEY is not set. Add it to your .env file to run AI-assertion tests ' +
            '(see .env.example). Get a free key at https://aistudio.google.com/apikey - ' +
            'these tests are opt-in and separate from the rest of the suite.'
        );
    }

    if (!client) {
        client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    return client;
}

// gemini-2.5-flash is fast, multimodal (handles the screenshots used for
// visual review), and available on Google's free tier.
export const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

/**
 * Ask Gemini a plain-text question and get a plain-text answer back.
 */
export async function askAI(prompt: string): Promise<string> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

/**
 * Ask Gemini to look at a screenshot (base64 PNG) and answer a question about it.
 * Used for AI-powered visual bug detection.
 */
export async function askAIAboutImage(base64Png: string, prompt: string): Promise<string> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: 'image/png',
                data: base64Png,
            },
        },
        prompt,
    ]);

    return result.response.text().trim();
}

/**
 * Ask Gemini to respond with strict JSON matching a described shape.
 * Strips markdown code fences defensively before parsing.
 */
export async function askAIForJSON<T>(prompt: string): Promise<T> {
    const raw = await askAI(
        `${prompt}\n\nRespond with ONLY raw JSON. No markdown code fences, no preamble, no explanation.`
    );

    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, '').trim();
    return JSON.parse(cleaned) as T;
}
