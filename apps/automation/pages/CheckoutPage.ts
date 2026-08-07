import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Covers all three steps of the SauceDemo checkout flow:
 *  - checkout-step-one.html  (information form)
 *  - checkout-step-two.html  (order overview)
 *  - checkout-complete.html  (confirmation)
 */
export class CheckoutPage extends BasePage {

    // Step One - Your Information
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly postalCodeInput: Locator;
    private readonly continueButton: Locator;
    private readonly cancelButton: Locator;
    private readonly errorMessage: Locator;

    // Step Two - Overview
    private readonly summaryItems: Locator;
    private readonly itemTotalLabel: Locator;
    private readonly taxLabel: Locator;
    private readonly totalLabel: Locator;
    private readonly finishButton: Locator;

    // Step Three - Complete
    private readonly completeHeader: Locator;
    private readonly completeText: Locator;
    private readonly backHomeButton: Locator;

    constructor(page: Page) {
        super(page);

        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.errorMessage = page.locator('[data-test="error"]');

        this.summaryItems = page.locator('.cart_item');
        this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
        this.taxLabel = page.locator('[data-test="tax-label"]');
        this.totalLabel = page.locator('[data-test="total-label"]');
        this.finishButton = page.locator('[data-test="finish"]');

        this.completeHeader = page.locator('[data-test="complete-header"]');
        this.completeText = page.locator('[data-test="complete-text"]');
        this.backHomeButton = page.locator('[data-test="back-to-products"]');
    }

    /** Step 1: fill in and submit customer information */
    async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.fill(this.firstNameInput, firstName);
        await this.fill(this.lastNameInput, lastName);
        await this.fill(this.postalCodeInput, postalCode);
    }

    async continueToOverview(): Promise<void> {
        await this.click(this.continueButton);
    }

    async cancel(): Promise<void> {
        await this.click(this.cancelButton);
    }

    async getErrorMessage(): Promise<string> {
        return await this.getText(this.errorMessage);
    }

    async isErrorDisplayed(): Promise<boolean> {
        return await this.isVisible(this.errorMessage);
    }

    /** Step 2: order overview */
    async getSummaryItemCount(): Promise<number> {
        return await this.summaryItems.count();
    }

    async getItemTotal(): Promise<number> {
        const text = await this.getText(this.itemTotalLabel);
        return this.parseCurrency(text);
    }

    async getTax(): Promise<number> {
        const text = await this.getText(this.taxLabel);
        return this.parseCurrency(text);
    }

    async getTotal(): Promise<number> {
        const text = await this.getText(this.totalLabel);
        return this.parseCurrency(text);
    }

    async finish(): Promise<void> {
        await this.click(this.finishButton);
    }

    /** Step 3: confirmation */
    async getCompleteHeader(): Promise<string> {
        return await this.getText(this.completeHeader);
    }

    async getCompleteText(): Promise<string> {
        return await this.getText(this.completeText);
    }

    async isOrderComplete(): Promise<boolean> {
        return await this.isVisible(this.completeHeader);
    }

    async backToProducts(): Promise<void> {
        await this.click(this.backHomeButton);
    }

    /** Full happy-path helper used by multiple specs */
    async completeCheckout(firstName: string, lastName: string, postalCode: string): Promise<void> {
        await this.fillInformation(firstName, lastName, postalCode);
        await this.continueToOverview();
        await this.finish();
    }

    private parseCurrency(text: string): number {
        const match = text.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : NaN;
    }
}
