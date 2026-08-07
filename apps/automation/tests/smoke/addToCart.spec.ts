import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Add To Cart Smoke Test', () => {

    test('Verify user can add a product to cart successfully', async ({ page }) => {

        // Initialize Page Objects
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        // Navigate to application
        await loginPage.navigate('/');

        // Login
        await loginPage.loginWithDefaultUser();

        // Verify Inventory page loaded
        await expect(page).toHaveURL(/inventory/);
        expect(await inventoryPage.isInventoryPageLoaded()).toBeTruthy();

        // Add product
        await inventoryPage.addProductToCart('Sauce Labs Backpack');

        // Verify cart badge
        expect(await inventoryPage.getCartItemCount()).toBe(1);

        // Open Cart
        await inventoryPage.openCart();

        // Verify Cart page
        expect(await cartPage.isCartPageLoaded()).toBeTruthy();

        // Verify Product
        expect(
            await cartPage.isProductInCart('Sauce Labs Backpack')
        ).toBeTruthy();

    });

});