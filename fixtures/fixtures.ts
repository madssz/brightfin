import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/Login.page';
import { AssetsServicesPage } from '../pages/Assets-services.page';
import { RequestsPage } from '../pages/Requests.page';
import { RequestedItemPage } from '../pages/Requested-item.page';
import { TelecomPage } from '../pages/Telecom.page';
import { MobileDevicePage } from '../pages/Mobile-device.page';
import { env } from 'process';

type MyFixtures = {
    loginPage: LoginPage,
    assetsServicesPage: AssetsServicesPage,
    requestsPage: RequestsPage,
    requestedItemPage: RequestedItemPage,
    tftPage: TelecomPage,
    mobileDevicePage: MobileDevicePage,
}

export const test = base.extend<MyFixtures>({
    loginPage: [async ({ page }, use) => {
        const username = env.PLAYWRIGHT_USERNAME;
        const password = env.PLAYWRIGHT_PASSWORD;
        if (!username || !password) {
            throw new Error('PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD must be set in .env');
        }
        await page.goto('/');
        const loginPage = new LoginPage(page);
        await loginPage.logIn(username, password);
        await use(loginPage);
    }, { auto: true }],
    assetsServicesPage: async ({ page }, use) => {
        const assetsServicesPage = new AssetsServicesPage(page);
        await use(assetsServicesPage);
    },
    requestsPage: async ({ page }, use) => {
        const requestsPage = new RequestsPage(page);
        await use(requestsPage);
    },
    requestedItemPage: async ({ page }, use) => {
        const requestedItemPage = new RequestedItemPage(page);
        await use(requestedItemPage);
    },
    tftPage: async ({ page }, use) => {
        const tftPage = new TelecomPage(page);
        await use(tftPage);
    },
    mobileDevicePage: async ({ page }, use) => {
        const mobileDevicePage = new MobileDevicePage(page);
        await use(mobileDevicePage);
    },
});
