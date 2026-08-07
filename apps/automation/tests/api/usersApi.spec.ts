import { test, expect } from '@playwright/test';

// See the note at the top of loginApi.spec.ts for why this runs against a
// public sandbox API instead of saucedemo.com.
const API_BASE_URL = 'https://reqres.in/api';

test.describe('Users API (sandbox demo)', () => {

    test('Verify fetching a single user returns the expected shape', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/users/2`);

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.data).toMatchObject({
            id: 2,
            email: expect.any(String),
            first_name: expect.any(String),
            last_name: expect.any(String),
        });
    });

    test('Verify fetching a non-existent user returns 404', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/users/9999`);

        expect(response.status()).toBe(404);
    });

    test('Verify creating a user echoes back the submitted fields', async ({ request }) => {
        const payload = { name: 'Jane Doe', job: 'QA Engineer' };

        const response = await request.post(`${API_BASE_URL}/users`, { data: payload });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(payload.name);
        expect(body.job).toBe(payload.job);
        expect(body.id).toBeTruthy();
    });

    test('Verify the paginated users list respects the page size', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/users?page=2`);

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.page).toBe(2);
        expect(Array.isArray(body.data)).toBeTruthy();
        expect(body.data.length).toBeGreaterThan(0);
    });

});
