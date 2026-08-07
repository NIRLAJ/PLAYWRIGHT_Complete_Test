import { test, expect } from '../../fixtures/pageFixtures';

test.describe('Logout Smoke Test', () => {

    test('Verify user can log out and is returned to the login page', async ({ page, loggedInPage }) => {

        // loggedInPage fixture already navigated to '/' and logged in
        await expect(page).toHaveURL(/inventory/);
        expect(await loggedInPage.isInventoryPageLoaded()).toBeTruthy();

        // Open the burger menu and log out
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('[data-test="logout-sidebar-link"]').click();

        // Verify we're back on the login page
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await expect(page.getByPlaceholder('Username')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    test('Verify session is cleared after logout (cannot access inventory directly)', async ({ page, loggedInPage }) => {

        await expect(page).toHaveURL(/inventory/);

        await page.locator('#react-burger-menu-btn').click();
        await page.locator('[data-test="logout-sidebar-link"]').click();
        await expect(page).toHaveURL('https://www.saucedemo.com/');

        // Attempting to go directly back to inventory.html without logging in
        // again should bounce the user back to the login page with an error.
        await page.goto('/inventory.html');
        await expect(page.locator('[data-test="error"]')).toBeVisible();
    });

});
