import { expect, type Page, type FrameLocator, Locator } from "@playwright/test";
import { DeviceOrder } from "../utils/test-data";

export class RequestedItemPage {
    private page: Page;
    private frame: FrameLocator;

    constructor(page: Page) {
        this.page = page;
        this.frame = this.page.frameLocator('iframe[name="gsft_main"]');
    }

    async openRequestedItem(ritmNumber: string, requestNumber: string, deviceOrder: DeviceOrder) {
        await expect(this.frame.getByRole('textbox', { name: 'Number', exact: true })).toHaveValue(ritmNumber);
        await expect(this.frame.getByRole('searchbox', { name: 'Request', exact: true })).toHaveValue(requestNumber);
        await expect(this.frame.getByRole('searchbox', { name: 'Requested for' })).toHaveValue(deviceOrder.attentionTo);
        await expect(this.frame.getByRole('combobox', { name: 'SubmitModel Family' })).toHaveValue(deviceOrder.device);
        await expect(this.frame.getByRole('combobox', { name: 'SubmitDevice' })).toHaveValue(deviceOrder.deviceFullName);
        await expect(this.frame.getByRole('combobox', { name: 'SubmitTelecom Provider' })).toHaveValue(deviceOrder.provider);
        await expect(this.frame.getByRole('combobox', { name: 'Location' })).toHaveValue(deviceOrder.location);
        await expect(this.frame.getByRole('textbox', { name: 'Attention To' })).toHaveValue(deviceOrder.attentionTo);
        await expect(this.frame.getByRole('textbox', { name: 'Contact Number' })).toHaveValue(deviceOrder.contactNumber);
    }

    get requestedTelecomLinks(): Locator {
        return this.frame.getByRole('link', { name: /^Open record: TEL\d+/ });
    }

    async openTelecomTask(): Promise<string> {
        const tftTab = this.frame.getByRole('tablist', { name: 'Related List Tabs' }).getByRole('tab', { name: /^Telecom Fulfillment Tasks/ });
        // TFT is created asynchronously by the workflow, so reload the form until it shows up
        await expect(async () => {
            await tftTab.click();
            try {
                await expect(this.requestedTelecomLinks).toBeVisible({ timeout: 5_000 });
            } catch (error) {
                await this.frame.locator('body').evaluate(() => location.reload());
                throw error;
            }
        }).toPass({ timeout: 45_000 });
        const telecomNumber = (await this.requestedTelecomLinks.innerText()).trim();
        await this.requestedTelecomLinks.click();
        await expect(this.frame.getByRole('heading', { name: `Telecom Fulfillment Task ${telecomNumber}`, level: 1 })).toBeVisible();
        return telecomNumber;
    }
}