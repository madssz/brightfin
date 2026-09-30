import { expect, FrameLocator, Locator, Page } from "@playwright/test";
import type { DeviceOrder } from "../utils/test-data";
export class RequestsPage {
    private page: Page;
    private filterTextbox: Locator;
    private frame: FrameLocator;

    constructor(page: Page) {
        this.page = page;
        this.filterTextbox = page.getByRole('textbox', { name: 'Enter search term to filter' });
        this.frame = this.page.frameLocator('iframe[name="gsft_main"]');
    }

    async findRequest(requestNumber: string, deviceOrder: DeviceOrder) {
        await this.filterTextbox.fill('Requests');
        await this.page.getByRole('link', { name: 'Requests 1 of 1', exact: true }).click();
        const searchField = this.frame.getByLabel('Search a specific field of');
        const searchBox = this.frame.getByRole('searchbox', { name: 'Search' });
        const requestLink = this.frame.getByRole('link', { name: `Open record: ${requestNumber}` });
        // The list can reload after the first render and drop the typed search, so retry
        await expect(async () => {
            await searchField.selectOption('number');
            await searchBox.fill(requestNumber);
            await searchBox.press('Enter');
            await expect(requestLink).toBeVisible({ timeout: 5_000 });
        }).toPass({ timeout: 30_000 });
        await requestLink.click();
        await expect(this.frame.getByRole('textbox', { name: 'Number' })).toHaveValue(requestNumber);
        await expect(this.frame.getByRole('combobox', { name: 'Requested for' })).toHaveValue(deviceOrder.attentionTo);
    }

    get requestedItemLinks(): Locator {
        return this.frame.getByRole('link', { name: /^Open record: RITM\d+/ });
    }

    async openRequestedItem(): Promise<string> {
        const ritmNumber = (await this.requestedItemLinks.innerText()).trim();
        await this.requestedItemLinks.click();
        await expect(this.frame.getByRole('heading', { name: `Requested Item ${ritmNumber}`, level: 1 })).toBeVisible();
        return ritmNumber;
    }
}