import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('Verify user can login successfully', async ({ page }) => {

    

    const loginPage = new LoginPage(page);

    await loginPage.navigate('/');
    await loginPage.loginWithDefaultUser();

    await expect(page).toHaveURL(/inventory/);
});