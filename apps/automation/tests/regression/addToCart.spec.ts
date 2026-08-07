import { test, expect } from '../../fixtures/pageFixtures';
import { products, sortOptions } from '../../data/testData';

test.describe('Add To Cart - Regression', () => {

    test('Verify user can add multiple products and badge reflects the total', async ({ loggedInPage }) => {
        await loggedInPage.addProductToCart(products.backpack);
        await loggedInPage.addProductToCart(products.bikeLight);
        await loggedInPage.addProductToCart(products.boltTShirt);

        expect(await loggedInPage.getCartItemCount()).toBe(3);
    });

    test('Verify "Add to cart" button becomes "Remove" once a product is added', async ({ loggedInPage }) => {
        expect(await loggedInPage.isProductInCart(products.fleeceJacket)).toBeFalsy();

        await loggedInPage.addProductToCart(products.fleeceJacket);

        expect(await loggedInPage.isProductInCart(products.fleeceJacket)).toBeTruthy();
    });

    test('Verify products can be sorted by name (A to Z)', async ({ loggedInPage }) => {
        await loggedInPage.sortProducts(sortOptions.nameAsc);

        const names = await loggedInPage.getProductNames();
        const sorted = [...names].sort((a, b) => a.localeCompare(b));

        expect(names).toEqual(sorted);
    });

    test('Verify products can be sorted by name (Z to A)', async ({ loggedInPage }) => {
        await loggedInPage.sortProducts(sortOptions.nameDesc);

        const names = await loggedInPage.getProductNames();
        const sorted = [...names].sort((a, b) => b.localeCompare(a));

        expect(names).toEqual(sorted);
    });

    test('Verify products can be sorted by price (low to high)', async ({ loggedInPage }) => {
        await loggedInPage.sortProducts(sortOptions.priceLowHigh);

        const prices = await loggedInPage.getProductPrices();
        const sorted = [...prices].sort((a, b) => a - b);

        expect(prices).toEqual(sorted);
    });

    test('Verify products can be sorted by price (high to low)', async ({ loggedInPage }) => {
        await loggedInPage.sortProducts(sortOptions.priceHighLow);

        const prices = await loggedInPage.getProductPrices();
        const sorted = [...prices].sort((a, b) => b - a);

        expect(prices).toEqual(sorted);
    });

    test('Verify cart badge is not shown when the cart is empty', async ({ loggedInPage }) => {
        expect(await loggedInPage.getCartItemCount()).toBe(0);
    });

});
