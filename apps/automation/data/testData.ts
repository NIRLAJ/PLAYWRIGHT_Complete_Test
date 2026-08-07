/**
 * Centralized test data for SauceDemo.
 * Keeping this separate from specs makes data-driven tests easy to extend
 * and keeps credentials/product names out of the test logic itself.
 */

export interface SauceUser {
    username: string;
    password: string;
    description: string;
    /** Whether this user is expected to successfully log in */
    canLogin: boolean;
}

// All documented SauceDemo demo accounts - https://www.saucedemo.com/
export const users: SauceUser[] = [
    {
        username: 'standard_user',
        password: 'secret_sauce',
        description: 'Standard user, no known issues',
        canLogin: true,
    },
    {
        username: 'locked_out_user',
        password: 'secret_sauce',
        description: 'User has been locked out by the site',
        canLogin: false,
    },
    {
        username: 'problem_user',
        password: 'secret_sauce',
        description: 'User sees broken product images',
        canLogin: true,
    },
    {
        username: 'performance_glitch_user',
        password: 'secret_sauce',
        description: 'User experiences significant UI lag',
        canLogin: true,
    },
    {
        username: 'error_user',
        password: 'secret_sauce',
        description: 'User triggers JS errors on certain actions',
        canLogin: true,
    },
    {
        username: 'visual_user',
        password: 'secret_sauce',
        description: 'User sees minor visual/CSS regressions',
        canLogin: true,
    },
];

export const standardUser = users.find((u) => u.username === 'standard_user')!;
export const lockedOutUser = users.find((u) => u.username === 'locked_out_user')!;

export const products = {
    backpack: 'Sauce Labs Backpack',
    bikeLight: 'Sauce Labs Bike Light',
    boltTShirt: 'Sauce Labs Bolt T-Shirt',
    fleeceJacket: 'Sauce Labs Fleece Jacket',
    onesie: 'Sauce Labs Onesie',
    redTShirt: 'Test.allTheThings() T-Shirt (Red)',
};

export const checkoutInfo = {
    valid: {
        firstName: 'Jane',
        lastName: 'Doe',
        postalCode: '12345',
    },
};

export const sortOptions = {
    nameAsc: 'az',
    nameDesc: 'za',
    priceLowHigh: 'lohi',
    priceHighLow: 'hilo',
};
