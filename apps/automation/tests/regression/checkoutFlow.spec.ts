import { test, expect } from '../../fixtures/pageFixtures';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { products, checkoutInfo } from '../../data/testData';

test.describe('Checkout Flow - Regression', () => {

    test.beforeEach(async ({ loggedInPage, page }) => {
        await loggedInPage.addProductToCart(products.backpack);
        const cartPage = new CartPage(page);
        await loggedInPage.openCart();
        await cartPage.checkout();
        await expect(page).toHaveURL(/checkout-step-one/);
    });

    test('Verify an error is shown when First Name is missing', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillInformation('', checkoutInfo.valid.lastName, checkoutInfo.valid.postalCode);
        await checkoutPage.continueToOverview();

        expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('First Name is required');
    });

    test('Verify an error is shown when Last Name is missing', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillInformation(checkoutInfo.valid.firstName, '', checkoutInfo.valid.postalCode);
        await checkoutPage.continueToOverview();

        expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('Last Name is required');
    });

    test('Verify an error is shown when Postal Code is missing', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillInformation(checkoutInfo.valid.firstName, checkoutInfo.valid.lastName, '');
        await checkoutPage.continueToOverview();

        expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
        expect(await checkoutPage.getErrorMessage()).toContain('Postal Code is required');
    });

    test('Verify cancelling from step one returns to the cart page', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.cancel();

        await expect(page).toHaveURL(/cart/);
    });

    test('Verify cancelling from step two returns to the inventory page', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillInformation(
            checkoutInfo.valid.firstName,
            checkoutInfo.valid.lastName,
            checkoutInfo.valid.postalCode
        );
        await checkoutPage.continueToOverview();
        await expect(page).toHaveURL(/checkout-step-two/);

        await checkoutPage.cancel();

        await expect(page).toHaveURL(/inventory/);
    });

    test('Verify the overview lists the exact product that was added to the cart', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillInformation(
            checkoutInfo.valid.firstName,
            checkoutInfo.valid.lastName,
            checkoutInfo.valid.postalCode
        );
        await checkoutPage.continueToOverview();
        await expect(page).toHaveURL(/checkout-step-two/);

        expect(await checkoutPage.getSummaryItemCount()).toBe(1);
        await expect(page.getByText(products.backpack)).toBeVisible();
    });

});
