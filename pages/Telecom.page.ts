import { type Page, type FrameLocator, type Locator, expect } from "@playwright/test";
import { DeviceOrder, TftDetails, TftState } from "../utils/test-data";

export class TelecomPage {
    private page: Page;
    private frame: FrameLocator;
    private state: Locator;
    private processDataJson: Locator;

    constructor(page: Page) {
        this.page = page;
        this.frame = this.page.frameLocator('iframe[name="gsft_main"]');
        this.state = this.frame.getByRole('combobox', { name: 'State', exact: true });
        this.processDataJson = this.frame.locator('[id="x_mobi_p_telecom_fulfillment_task.process_data_json"]');
    }

    async telecomValidation(telecomNumber: string, requestNumber: string, deviceOrder: DeviceOrder) {
        await expect(this.frame.getByRole('textbox', { name: 'Number' })).toHaveValue(telecomNumber);
        await expect(this.frame.getByRole('textbox', { name: 'Order' })).toHaveValue(requestNumber);
        await expect(this.frame.getByRole('searchbox', { name: 'Telecom Contract', exact: true })).toHaveValue(new RegExp(deviceOrder.provider, 'i'));
        await expect(this.frame.getByRole('searchbox', { name: 'Requested By' })).toHaveValue(deviceOrder.attentionTo);
        const summaryTab = this.frame.getByRole('tab', { name: 'Summary' });
        const requestSummary = this.frame.getByRole('textbox', { name: 'Request Summary' });
        // Form tabs initialise after load; until then sections are hidden
        await expect(async () => {
            if (await summaryTab.isVisible()) {
                await summaryTab.click();
            }
            await expect(requestSummary).toBeVisible({ timeout: 2_000 });
        }).toPass({ timeout: 20_000 });
        await expect(requestSummary).not.toHaveValue('');
        const normalizedSummary = (await requestSummary.inputValue()).replace(/\s+/g, ' ');

        expect(normalizedSummary).toContain(`Accessories: ${deviceOrder.accessory}`);
        expect(normalizedSummary).toContain(`Device: ${deviceOrder.deviceFullName}`);
        expect(normalizedSummary).toContain(`Requested for: ${deviceOrder.attentionTo}`);
        expect(normalizedSummary).toContain(`Requestor: ${deviceOrder.attentionTo}`);
        expect(normalizedSummary).toContain(`Mobile phone: ${deviceOrder.contactNumber}`);
        expect(normalizedSummary).toContain(`Address 1: ${deviceOrder.address}`);
        expect(normalizedSummary).toContain(`Shipping Attention To: ${deviceOrder.attentionTo}`);
        expect(normalizedSummary).toContain(`Attention to Contact number: ${deviceOrder.contactNumber}`);
        expect(normalizedSummary).toContain(`Telecom Provider: ${deviceOrder.provider}`);
    }

    async changeStateToInProgress() {
        await this.state.selectOption(TftState.InProgress);
        await this.saveViaHeaderContextMenu();
        await expect(this.state).toHaveValue(TftState.InProgress);
    }

    async saveViaHeaderContextMenu() {
        const header = this.frame.locator('[id="x_mobi_p_telecom_fulfillment_task.form_header"]').getByText('Telecom Fulfillment Task', { exact: true });
        const save = this.frame.getByRole('menuitem', { name: 'Save', exact: true });
        await expect(async () => {
            await header.click({ button: 'right' });
            await expect(save).toBeVisible({ timeout: 2_000 });
        }).toPass({ timeout: 20_000 });
        // Mark the current document so we can detect when Save replaces it with a new one
        await header.evaluate(() => { (window as any).__beforeSave = true; });
        await save.click({ noWaitAfter: true });
        await expect.poll(
            () => header.evaluate(() => !(window as any).__beforeSave).catch(() => false),
            { timeout: 30_000 },
        ).toBe(true);
        await expect(header).toBeVisible();
    }

    async changeStateToWithCarrier() {
        await this.state.selectOption(TftState.WithCarrier);
        await this.saveViaHeaderContextMenu();
        await expect(this.state).toHaveValue(TftState.WithCarrier);
    }

    async fillTftDetails(details: TftDetails) {
        await this.frame.getByRole('button', { name: 'Set TFT details' }).first().click();
        const dialog: FrameLocator = this.frame.getByRole('dialog', { name: 'TFT details' }).locator('iframe').contentFrame();

        await dialog.getByRole('textbox', { name: 'Order Number' }).fill(details.orderNumber);
        // Masked inputs ignore fill(), they need real key presses.
        const imei = dialog.getByRole('textbox', { name: 'Device IMEI' });
        await imei.pressSequentially(details.imei);
        await expect(imei).toHaveValue(new RegExp(`^${details.imei}_*$`));

        const date = dialog.getByRole('textbox', { name: 'Shipment Date' });
        await date.fill('');
        await date.pressSequentially(details.shipmentDate);
        await date.press('Tab');
        await expect(date).toHaveValue(details.shipmentDate);

        await dialog.getByRole('button', { name: 'Select box activate' }).first().click();
        await dialog.getByRole('option', { name: details.carrier, exact: true }).click();

        await dialog.getByRole('textbox', { name: 'Tracker Number' }).fill(details.trackingNumber);

        const price = dialog.getByRole('textbox', { name: '0000.00' });
        await price.fill('');
        await price.pressSequentially(details.priceDigits);

        await dialog.getByRole('button', { name: 'Submit' }).click();
        await expect(this.frame.getByRole('dialog', { name: 'TFT details' })).toBeHidden({ timeout: 15_000 });
        await expect(this.processDataJson).toHaveValue(new RegExp(details.imei));
    }

    async readProcessData(): Promise<Record<string, string>> {
        return JSON.parse(await this.processDataJson.inputValue());
    }

    async complete(details: TftDetails) {
        await this.fillTftDetails(details);
        await this.state.selectOption(TftState.Completed);
        await this.saveViaHeaderContextMenu();
        await expect(this.state).toHaveValue(TftState.Completed);
        expect(await this.readProcessData()).toMatchObject({
            output_imei: details.imei,
            output_order_number: details.orderNumber,
            output_tracking_number: details.trackingNumber,
        });
    }
}