import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

/**
 * Extends Playwright's base `test` with ready-to-use Page Object instances.
 *
 * Instead of every spec doing:
 *   const loginPage = new LoginPage(page);
 *   const inventoryPage = new InventoryPage(page);
 *   ...
 *
 * specs can simply destructure what they need:
 *   test('...', async ({ loginPage, inventoryPage }) => { ... });
 *
 * Each fixture is created lazily (only if the test actually asks for it)
 * and shares the same `page` instance for that test.
 */
type PageFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    /** Logs in as the default .env user and lands on the inventory page. */
    loggedInPage: InventoryPage;
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },

    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },

    loggedInPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await loginPage.navigate('/');
        await loginPage.loginWithDefaultUser();

        await use(inventoryPage);
    },
});

export { expect } from '@playwright/test';
