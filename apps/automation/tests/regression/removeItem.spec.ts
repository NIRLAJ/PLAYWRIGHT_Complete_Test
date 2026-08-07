import { test, expect } from '../../fixtures/pageFixtures';
import { CartPage } from '../../pages/CartPage';
import { products } from '../../data/testData';

test.describe('Remove Item - Regression', () => {

    test('Verify product can be removed from the inventory page', async ({ loggedInPage }) => {
        await loggedInPage.addProductToCart(products.backpack);
        expect(await loggedInPage.getCartItemCount()).toBe(1);

        await loggedInPage.removeProductFromCart(products.backpack);
        expect(await loggedInPage.getCartItemCount()).toBe(0);
        expect(await loggedInPage.isProductInCart(products.backpack)).toBeFalsy();
    });

    test('Verify product can be removed from the cart page', async ({ page, loggedInPage }) => {
        const cartPage = new CartPage(page);

        await loggedInPage.addProductToCart(products.bikeLight);
        await loggedInPage.openCart();

        expect(await cartPage.isProductInCart(products.bikeLight)).toBeTruthy();
        expect(await cartPage.getCartItemCount()).toBe(1);

        await cartPage.removeProduct(products.bikeLight);

        expect(await cartPage.getCartItemCount()).toBe(0);
        expect(await cartPage.isProductInCart(products.bikeLight)).toBeFalsy();
    });

    test('Verify removing one of several products only removes that product', async ({ page, loggedInPage }) => {
        const cartPage = new CartPage(page);

        await loggedInPage.addProductToCart(products.backpack);
        await loggedInPage.addProductToCart(products.bikeLight);
        await loggedInPage.addProductToCart(products.onesie);
        expect(await loggedInPage.getCartItemCount()).toBe(3);

        await loggedInPage.openCart();
        await cartPage.removeProduct(products.bikeLight);

        expect(await cartPage.getCartItemCount()).toBe(2);
        expect(await cartPage.isProductInCart(products.backpack)).toBeTruthy();
        expect(await cartPage.isProductInCart(products.onesie)).toBeTruthy();
        expect(await cartPage.isProductInCart(products.bikeLight)).toBeFalsy();
    });

    test('Verify cart badge disappears once the cart is emptied', async ({ page, loggedInPage }) => {
        const cartPage = new CartPage(page);

        await loggedInPage.addProductToCart(products.redTShirt);
        await loggedInPage.openCart();
        await cartPage.removeProduct(products.redTShirt);

        await loggedInPage.navigate('/inventory.html');
        expect(await loggedInPage.getCartItemCount()).toBe(0);
    });

});
