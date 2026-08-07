import { test, expect } from '../../fixtures/pageFixtures';
import { users } from '../../data/testData';

/**
 * AI-assisted test authoring.
 *
 * This spec was scaffolded by driving a real browser against
 * https://www.saucedemo.com through the Playwright MCP server (see
 * /.mcp.json) with an AI coding agent (Claude Code / Claude in an
 * MCP-enabled editor). The agent used the MCP browser tools to open the
 * app, try each of the six documented demo accounts, inspect the resulting
 * DOM/URL/error state for each one, and propose this data-driven coverage -
 * which was then reviewed and committed like any other code.
 *
 * That's the intended MCP workflow for this framework: MCP drives
 * *exploration and authoring* at development time; the committed
 * TypeScript below is what actually runs in CI (no MCP server or AI call
 * needed at test-run time).
 */

test.describe('AI-Assisted: Login Behaviour Across All Demo Accounts', () => {

    for (const user of users) {
        test(`Verify login outcome for "${user.username}" (${user.description})`, async ({ page, loginPage }) => {
            await loginPage.navigate('/');
            await loginPage.login(user.username, user.password);

            if (user.canLogin) {
                await expect(page).toHaveURL(/inventory/);
                expect(await loginPage.isErrorDisplayed()).toBeFalsy();
            } else {
                await expect(page).toHaveURL('https://www.saucedemo.com/');
                expect(await loginPage.isErrorDisplayed()).toBeTruthy();
            }
        });
    }

    test('Verify an unrecognized username shows a generic credentials error', async ({ loginPage }) => {
        await loginPage.navigate('/');
        await loginPage.login('not_a_real_user', 'secret_sauce');

        expect(await loginPage.isErrorDisplayed()).toBeTruthy();
        expect(await loginPage.getErrorMessage()).toContain('Username and password do not match');
    });

    test('Verify submitting the form with empty fields shows a required-field error', async ({ loginPage }) => {
        await loginPage.navigate('/');
        await loginPage.login('', '');

        expect(await loginPage.isErrorDisplayed()).toBeTruthy();
        expect(await loginPage.getErrorMessage()).toContain('Username is required');
    });

});
