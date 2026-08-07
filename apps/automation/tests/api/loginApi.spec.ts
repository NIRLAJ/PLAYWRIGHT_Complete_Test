import { test, expect } from '@playwright/test';

/**
 * NOTE ON API TESTING FOR THIS PROJECT
 * -------------------------------------
 * saucedemo.com is a purely front-end demo app: there is no public REST/JSON
 * API behind it (auth, cart and checkout are all handled client-side in the
 * browser). So there is nothing meaningful to API-test on saucedemo itself.
 *
 * This folder is kept so the framework demonstrates a complete testing
 * pyramid (UI + API + AI). The specs here run against https://reqres.in,
 * a free public sandbox API, purely to show the pattern: using Playwright's
 * built-in `request` fixture for fast, UI-independent API checks that live
 * in the same framework, share the same config/reporting, and can run in CI
 * alongside the UI suite.
 *
 * Swap the baseURL/endpoints below for your own backend when you have one.
 */

const API_BASE_URL = 'https://reqres.in/api';

test.describe('Login API (sandbox demo)', () => {

    test('Verify a valid login returns a token', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login`, {
            data: {
                email: 'eve.holt@reqres.in',
                password: 'cityslicka',
            },
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.token).toBeTruthy();
    });

    test('Verify login without a password returns a 400 with an error message', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/login`, {
            data: {
                email: 'eve.holt@reqres.in',
            },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Missing password');
    });

});
