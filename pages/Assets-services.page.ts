import { FrameLocator, Locator, Page } from "@playwright/test";
import { DeviceOrder } from "../utils/test-data";

export class AssetsServicesPage {
    private page: Page;
    private filterTextbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.filterTextbox = page.getByRole('textbox', { name: 'Enter search term to filter' });
    }

    async openAssetsAndServices(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');

        await this.filterTextbox.fill('My Assets & Services');
        await this.page.getByRole('link', { name: /My Assets & Services/i }).click();

        const targetPage = await popupPromise;
        await targetPage.waitForLoadState('domcontentloaded');
        return targetPage;
    }

    async getRequestNumber(form: FrameLocator): Promise<string> {
        const heading = form.getByRole('heading', { name: /^REQ\d+\b/ });
        const text = await heading.innerText();
        const requestNumber = text.match(/^REQ\d+/)?.[0];
        if (!requestNumber) {
            throw new Error(`Request number not found in "${text}"`);
        }
        return requestNumber;
    }

    async orderNewDevice(deviceOrder: DeviceOrder) {
        const targetPage = await this.openAssetsAndServices();
        await targetPage.getByRole('button', { name: 'devices_other Order New' }).click();

        const form = targetPage.frameLocator('#mcframe');
        await form.locator('#s2id_sp_formfield_provider').click();
        await form.getByRole('option', { name: deviceOrder.providerOption, exact: true }).click();
        await form.getByRole('button', { name: deviceOrder.deviceOption }).click();
        await form.getByRole('button', { name: deviceOrder.accessory }).click();
        await form.locator('a.select2-choice.select2-default.form-control:visible').click();
        await form.getByRole('combobox', { name: 'Select Location' }).fill(deviceOrder.locationSearch);
        await form.getByRole('option', { name: deviceOrder.location, exact: true }).click();
        await form.getByRole('textbox', { name: 'Attention To' }).fill(deviceOrder.attentionTo);
        await form.getByRole('textbox', { name: 'Contact Number' }).fill(deviceOrder.contactNumber);
        await form.getByRole('button', { name: 'Submit' }).click();
        return this.getRequestNumber(form);
    }
}