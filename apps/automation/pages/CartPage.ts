import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {

    // Locators
    private readonly pageTitle: Locator;
    private readonly checkoutButton: Locator;
    private readonly continueShoppingButton: Locator;
    private readonly cartItems: Locator;

    constructor(page: Page) {
        super(page);

        this.pageTitle = page.locator('[data-test="title"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
        this.cartItems = page.locator('.cart_item');
    }

    /**
     * Verify Cart page is loaded
     */
    async isCartPageLoaded(): Promise<boolean> {
        return await this.isVisible(this.pageTitle);
    }

    /**
     * Get Cart page title
     */
    async getPageTitle(): Promise<string> {
        return await this.getText(this.pageTitle);
    }

    /**
     * Get number of items in cart
     */
    async getCartItemCount(): Promise<number> {
        return await this.cartItems.count();
    }

    /**
     * Verify product exists in cart
     */
    async isProductInCart(productName: string): Promise<boolean> {

        const product = this.page
            .locator('.cart_item')
            .filter({
                has: this.page.getByText(productName)
            });

        return await product.isVisible();
    }

    /**
     * Remove product from cart
     */
    async removeProduct(productName: string): Promise<void> {

        const product = this.page
            .locator('.cart_item')
            .filter({
                has: this.page.getByText(productName)
            });

        await product.getByRole('button', { name: 'Remove' }).click();
    }

    /**
     * Click Checkout
     */
    async checkout(): Promise<void> {
        await this.click(this.checkoutButton);
    }

    /**
     * Continue Shopping
     */
    async continueShopping(): Promise<void> {
        await this.click(this.continueShoppingButton);
    }

}