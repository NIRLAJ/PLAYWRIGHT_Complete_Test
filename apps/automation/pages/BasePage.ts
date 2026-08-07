import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a page.
     * Example:
     * await navigate("/");
     */
    async navigate(path: string = ''): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Click an element.
     */
    async click(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    /**
     * Fill text into an input field.
     */
    async fill(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(value);
    }

    /**
     * Clear an input field.
     */
    async clear(locator: Locator): Promise<void> {
        await locator.clear();
    }

    /**
     * Get text from an element.
     */
    async getText(locator: Locator): Promise<string> {
        await locator.waitFor({ state: 'visible' });
        return (await locator.textContent()) ?? '';
    }

    /**
     * Check if an element is visible.
     */
    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    /**
     * Wait until an element is visible.
     */
    async waitForVisible(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
    }

    /**
     * Hover over an element.
     */
    async hover(locator: Locator): Promise<void> {
        await locator.hover();
    }

    /**
     * Press a keyboard key.
     */
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /**
     * Take a screenshot.
     */
    async takeScreenshot(fileName: string): Promise<void> {
        await this.page.screenshot({
            path: `apps/automation/reports/${fileName}.png`,
            fullPage: true,
        });
    }

    /**
     * Get the current page title.
     */
    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Refresh the current page.
     */
    async refresh(): Promise<void> {
        await this.page.reload();
    }

    /**
     * Verify that an element is visible.
     */
    async verifyVisible(locator: Locator): Promise<void> {
        await expect(locator).toBeVisible();
    }

    /**
     * Verify the page title.
     */
    async verifyTitle(expectedTitle: string): Promise<void> {
        await expect(this.page).toHaveTitle(expectedTitle);
    }
}