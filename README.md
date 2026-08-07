# AI-QA-Framework

An AI-augmented **Playwright + TypeScript** test automation framework for
[saucedemo.com](https://www.saucedemo.com/), built on the Page Object Model,
with the **Playwright MCP server** wired in for AI-driven exploratory
testing and test authoring - runnable entirely on free-tier tools.

---

## 1. Tech stack

| Layer              | Tool                                             |
|---------------------|--------------------------------------------------|
| Test runner         | Playwright Test                                   |
| Language             | TypeScript                                        |
| Design pattern       | Page Object Model + custom fixtures               |
| API testing          | Playwright's built-in `request` fixture           |
| AI (in-test)         | Google Gemini API (`@google/generative-ai`) - free tier |
| AI (dev-time)        | Playwright MCP server + any MCP-capable AI client (OpenCode, Claude Code, Cursor, VS Code + Copilot) |
| CI                   | GitHub Actions                                     |

---

## 2. Project structure

```
AI-QA-Framework/
├── .mcp.json                          # Playwright MCP config for Claude Code / Cursor / VS Code
├── opencode.json                      # Playwright MCP config for OpenCode
├── .env.example                       # Copy to .env and fill in
├── playwright.config.ts
├── tsconfig.json
├── .github/workflows/playwright.yml   # CI pipeline
└── apps/automation/
    ├── pages/                         # Page Object Model
    │   ├── BasePage.ts
    │   ├── LoginPage.ts
    │   ├── InventoryPage.ts
    │   ├── CartPage.ts
    │   └── CheckoutPage.ts
    ├── fixtures/
    │   └── pageFixtures.ts            # Injects page objects into tests, + `loggedInPage`
    ├── data/
    │   └── testData.ts                # Users, product names, checkout data
    ├── utils/
    │   ├── aiClient.ts                # Thin Google Gemini SDK wrapper
    │   └── aiAssert.ts                # AI-powered visual/semantic assertions
    └── tests/
        ├── smoke/                     # Fast, critical-path checks
        ├── regression/                # Broader functional coverage
        ├── api/                       # request-fixture based API checks
        └── ai/                        # AI-assisted / AI-assertion specs
```

---

## 3. Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env      # fill in GEMINI_API_KEY if you want the AI specs to run
```

## 4. Running tests

```bash
npm test                  # everything
npm run test:smoke        # smoke suite only
npm run test:regression   # regression suite only
npm run test:api          # API suite only
npm run test:ai           # AI-assertion suite only (needs GEMINI_API_KEY)
npm run test:headed       # watch the browser
npm run test:ui           # Playwright's interactive UI mode
npm run report            # open the last HTML report
```

The AI specs (`apps/automation/tests/ai/aiBugValidation.spec.ts`) are
**self-skipping** if `GEMINI_API_KEY` isn't set, so `npm test` works out
of the box with zero AI configuration.

---

## 5. Where AI actually fits in - two separate integrations

It's easy to conflate "AI writes my tests" with "AI runs inside my tests."
This framework does **both**, deliberately kept separate:

### 5.1 Dev-time: Playwright MCP server (AI drives the browser to help build tests)

`@playwright/mcp` is Microsoft's official **Model Context Protocol** server
for Playwright. It exposes browser actions (navigate, click, fill, snapshot
the accessibility tree, take a screenshot, etc.) as MCP *tools* that any
MCP-capable AI client can call.

Two config files register it, one per client style:
- **`.mcp.json`** - the format read by Claude Code, Cursor, and VS Code.
- **`opencode.json`** - the format read by [OpenCode](https://opencode.ai),
  the free, open-source, provider-agnostic coding agent. This is the
  recommended path if you don't have a paid AI subscription: install
  OpenCode, connect a free model (Google Gemini's free tier or Groq both
  work well, or a local Ollama model for zero API calls at all), and it
  picks up `opencode.json` automatically.

Either way, once connected, the AI agent can:
- launch a real browser and click through saucedemo.com itself,
- read the live DOM/accessibility tree instead of guessing selectors,
- generate new Page Object methods or spec files based on what it actually
  found on the page,
- help debug a failing test by re-running the exact steps interactively.

This is how `apps/automation/tests/ai/aiGeneratedTests.spec.ts` was
scaffolded: the agent used the MCP browser tools to try every documented
SauceDemo demo account (`standard_user`, `locked_out_user`,
`problem_user`, etc.), observed the real outcome for each, and proposed the
data-driven test - which was then reviewed like any other pull request.

**Important:** the MCP server is a *development-time* tool. It is **not**
a runtime dependency of the test suite - CI never starts it. What gets
committed is plain, deterministic TypeScript that Playwright Test runs on
its own.

To use it yourself: open the project folder with `opencode` (or in
Claude Code / Cursor) - it auto-detects the matching config file and offers
to connect. You can also run the server standalone with
`npm run mcp:playwright`.

### 5.2 Run-time: Gemini API for AI-powered assertions (AI judges the app)

`apps/automation/utils/aiClient.ts` wraps the Google Gemini SDK
(`@google/generative-ai`) directly - chosen specifically because
[Google AI Studio](https://aistudio.google.com/apikey) offers a genuinely
free tier with no credit card required, keeping this whole framework
runnable at $0. `apps/automation/utils/aiAssert.ts` builds two assertion
helpers on top of it:

- **`expectNoVisualBugs(page, testInfo, context)`** - screenshots the page
  and asks Gemini's vision model to flag genuine visual defects (broken
  images, overlapping text, misaligned layout) that CSS-selector-based
  assertions can't catch. Used in `aiBugValidation.spec.ts` to confirm the
  standard user's page looks clean, and to confirm the AI *does* flag the
  `problem_user` account's known-broken product images (a sanity check
  that the AI assertion is actually doing something, not always passing).
- **`aiSemanticMatch(actual, expectedIntent)`** - asks Gemini whether an
  actual message means the same thing as an expected intent, so a test
  doesn't break the moment the app's copy is reworded (e.g. checking the
  locked-out error still communicates "account disabled" even if the exact
  wording changes).

These use the model set by `AI_MODEL` in `.env` (defaults to
`gemini-2.5-flash`), and every screenshot/verdict sent through them is
attached to the Playwright HTML report for review.

**Which AI:** Google's Gemini, via the official `@google/generative-ai`
SDK, and the official `@playwright/mcp` server for dev-time browser
driving. Both were picked to keep the entire framework usable without a
paid subscription.

---

## 6. API testing note

`saucedemo.com` is a static front-end demo: login, cart, and checkout are
all handled client-side in the browser, with no backend REST/JSON API to
call. So `apps/automation/tests/api/` runs against
[reqres.in](https://reqres.in), a free public sandbox API, **purely to
demonstrate the pattern** (using Playwright's `request` fixture for fast,
UI-independent checks in the same framework/report/CI run). Point
`API_BASE_URL` in those two files at your own backend when you have one.

---

## 7. CI/CD

`.github/workflows/playwright.yml` runs on every push/PR to `main`:
1. `ui-and-api-tests` - type-check, then smoke, regression, and API suites
   (blocking).
2. `ai-assertion-tests` - the AI suite, in its own job with
   `continue-on-error: true` so an AI-judgment call never blocks a
   deployment. Needs a `GEMINI_API_KEY` repository secret to actually run;
   skips itself otherwise.

Both jobs upload the Playwright HTML report as a build artifact.

---

## 8. Extending the framework

- New page → add it under `apps/automation/pages/`, register it in
  `apps/automation/fixtures/pageFixtures.ts`.
- New test data → `apps/automation/data/testData.ts`.
- New suite → new folder under `apps/automation/tests/`, add a matching
  `test:<name>` script in `package.json`.
- To explore the app before writing a test, open the repo with `opencode`
  (or in an MCP-aware editor) and ask it to click around saucedemo.com
  using the `playwright` MCP tools - then turn what it finds into a
  committed spec.

---

## 9. Security note

Never paste real API keys into chat tools, commit messages, or issues.
`.env` is already excluded via `.gitignore`. If a key is ever exposed,
revoke/regenerate it immediately at the provider's console before using it
again.
