import { expect, Locator, Page } from "@playwright/test";
import type { FrameLocator } from "@playwright/test";
import type { DeviceOrder } from "../utils/test-data";
export class MobileDevicePage {
    private page: Page;
    private filterTextbox: Locator;
    private frame: FrameLocator;

    constructor(page: Page) {
        this.page = page;
        this.filterTextbox = page.getByRole('textbox', { name: 'Enter search term to filter' });
        this.frame = this.page.frameLocator('iframe[name="gsft_main"]');
    }

    async openMobileDevices() {
        await this.filterTextbox.fill('Mobile Devices');
        await this.page.getByRole('link', { name: /^Mobile Devices/ }).first().click();
        await expect(this.frame.locator('table.list_table').first()).toBeVisible();
    }

    async expectCreatedFor(imei: string, deviceOrder: DeviceOrder) {
        await this.openMobileDevices();
        const query = encodeURIComponent(`imei=${imei}`);

        // The device is created asynchronously after the TFT is completed
        await expect(async () => {
            await this.navigateFrame(`/x_mobi_c_mobile_device_list.do?sysparm_query=${query}`);
            await expect(this.frame.locator('table.list_table').first()).toBeVisible();
            await expect(this.frame.locator('tr.list_row')).toHaveCount(1, { timeout: 3_000 });
        }).toPass({ timeout: 60_000 });

        // Row links may point to related records (e.g. User), so open the device form directly
        await this.navigateFrame(`/x_mobi_c_mobile_device.do?sysparm_query=${query}`);

        // Some fields sit in collapsed form sections, so target them by id instead of role
        await expect(this.frame.locator('[id="x_mobi_c_mobile_device.imei"]')).toHaveValue(imei, { timeout: 15_000 });
        await expect(this.frame.locator('[id="x_mobi_c_mobile_device.name"]')).toHaveValue(`${deviceOrder.attentionTo}:${deviceOrder.deviceFullName}`);
        await expect(this.frame.locator('[id="sys_display.x_mobi_c_mobile_device.assigned_to"]')).toHaveValue(deviceOrder.attentionTo);
        await expect(this.frame.locator('[id="sys_display.x_mobi_c_mobile_device.model_id"]')).toHaveValue(deviceOrder.deviceFullName);
    }

    private async navigateFrame(url: string) {
        await this.frame.locator('body').evaluate((_, target) => location.assign(target), url);
    }
}
