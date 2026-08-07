import { test, expect } from '../../fixtures/pageFixtures';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { products, checkoutInfo } from '../../data/testData';

test.describe('Checkout Smoke Test', () => {

    test('Verify user can complete a purchase end to end', async ({ page, loggedInPage }) => {

        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        // Add a product and go to cart
        await loggedInPage.addProductToCart(products.backpack);
        expect(await loggedInPage.getCartItemCount()).toBe(1);

        await loggedInPage.openCart();
        expect(await cartPage.isProductInCart(products.backpack)).toBeTruthy();

        // Proceed to checkout
        await cartPage.checkout();
        await expect(page).toHaveURL(/checkout-step-one/);

        // Step one: information
        await checkoutPage.fillInformation(
            checkoutInfo.valid.firstName,
            checkoutInfo.valid.lastName,
            checkoutInfo.valid.postalCode
        );
        await checkoutPage.continueToOverview();
        await expect(page).toHaveURL(/checkout-step-two/);

        // Step two: overview - totals should add up
        const itemTotal = await checkoutPage.getItemTotal();
        const tax = await checkoutPage.getTax();
        const total = await checkoutPage.getTotal();
        expect(total).toBeCloseTo(itemTotal + tax, 2);

        // Step three: finish
        await checkoutPage.finish();
        await expect(page).toHaveURL(/checkout-complete/);
        expect(await checkoutPage.isOrderComplete()).toBeTruthy();
        expect(await checkoutPage.getCompleteHeader()).toContain('Thank you');

        // Back to products should clear the cart
        await checkoutPage.backToProducts();
        await expect(page).toHaveURL(/inventory/);
        expect(await loggedInPage.getCartItemCount()).toBe(0);
    });

});
