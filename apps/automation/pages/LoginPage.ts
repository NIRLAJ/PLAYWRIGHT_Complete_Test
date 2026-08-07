import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {

    // Locators
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);

        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.locator('[data-test="error"]');
    }

    /**
     * Login with username and password
     */
    async login(username: string, password: string): Promise<void> {
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    /**
     * Login using credentials from .env
     */
    async loginWithDefaultUser(): Promise<void> {
    await this.login(
        process.env.APP_USERNAME || 'standard_user',
        process.env.APP_PASSWORD || 'secret_sauce'
    );
}

    /**
     * Get login error message
     */
    async getErrorMessage(): Promise<string> {
        return await this.getText(this.errorMessage);
    }

    /**
     * Check whether error message is displayed
     */
    async isErrorDisplayed(): Promise<boolean> {
        return await this.isVisible(this.errorMessage);
    }
}