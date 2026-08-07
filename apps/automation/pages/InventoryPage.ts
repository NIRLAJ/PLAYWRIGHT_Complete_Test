import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {

    // Locators
    private readonly pageTitle: Locator;
    private readonly shoppingCart: Locator;
    private readonly cartBadge: Locator;
    private readonly inventoryItems: Locator;
    private readonly sortDropdown: Locator;

    constructor(page: Page) {
        super(page);

        this.pageTitle = page.locator('[data-test="title"]');
        this.shoppingCart = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.inventoryItems = page.locator('.inventory_item');
        this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    }

    /**
     * Verify inventory page loaded
     */
    async isInventoryPageLoaded(): Promise<boolean> {
        return await this.isVisible(this.pageTitle);
    }

    /**
     * Get page title
     */
    async getPageTitle(): Promise<string> {
        return await this.getText(this.pageTitle);
    }

    /**
     * Get total number of products
     */
    async getProductCount(): Promise<number> {
        return await this.inventoryItems.count();
    }

    /**
     * Add any product to cart
     */
    async addProductToCart(productName: string): Promise<void> {

        const product = this.page
            .locator('.inventory_item')
            .filter({
                has: this.page.locator('[data-test="inventory-item-name"]', {
                    hasText: productName
                })
            });

        await product.getByRole('button', { name: 'Add to cart' }).click();
    }

    /**
     * Remove any product from cart
     */
    async removeProductFromCart(productName: string): Promise<void> {

        const product = this.page
            .locator('.inventory_item')
            .filter({
                has: this.page.locator('[data-test="inventory-item-name"]', {
                    hasText: productName
                })
            });

        await product.getByRole('button', { name: 'Remove' }).click();
    }

    /**
     * Open shopping cart
     */
    async openCart(): Promise<void> {
        await this.click(this.shoppingCart);
    }

    /**
     * Get cart badge count
     */
    async getCartItemCount(): Promise<number> {

        if (!(await this.cartBadge.isVisible()))
            return 0;

        return Number(await this.cartBadge.textContent());
    }

    /**
     * Sort products
     */
    async sortProducts(value: string): Promise<void> {
        await this.sortDropdown.selectOption(value);
    }

    /**
     * Get all product names in the order rendered on the page
     */
    async getProductNames(): Promise<string[]> {
        return await this.page.locator('[data-test="inventory-item-name"]').allTextContents();
    }

    /**
     * Get all product prices (as numbers) in the order rendered on the page
     */
    async getProductPrices(): Promise<number[]> {
        const priceTexts = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
        return priceTexts.map((price) => parseFloat(price.replace('$', '')));
    }

    /**
     * Check if a given product's "Add to cart" button has switched to "Remove"
     */
    async isProductInCart(productName: string): Promise<boolean> {
        const product = this.page
            .locator('.inventory_item')
            .filter({
                has: this.page.locator('[data-test="inventory-item-name"]', {
                    hasText: productName,
                }),
            });

        return await product.getByRole('button', { name: 'Remove' }).isVisible();
    }

    /**
     * Open the product detail page by clicking its name
     */
    async openProductDetails(productName: string): Promise<void> {
        await this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }).click();
    }
}