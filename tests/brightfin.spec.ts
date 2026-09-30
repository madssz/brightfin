import { test } from "../fixtures/fixtures";
import { buildDeviceOrder, buildTftDetails } from "../utils/test-data";

test('Order New Device: request -> TFT completed -> mobile device created', async ({
  assetsServicesPage,
  requestsPage,
  requestedItemPage,
  tftPage,
  mobileDevicePage,
}) => {
  test.setTimeout(180_000);
  const order = buildDeviceOrder();
  const tftDetails = buildTftDetails();

  const requestNumber = await test.step('Order a new device', () =>
    assetsServicesPage.orderNewDevice(order));

  await test.step(`Request ${requestNumber} is created for the user`, () =>
    requestsPage.findRequest(requestNumber, order));

  const ritmNumber = await test.step('Open the requested item', () => requestsPage.openRequestedItem());

  await test.step(`Requested item ${ritmNumber} has the order details`, () =>
    requestedItemPage.openRequestedItem(ritmNumber, requestNumber, order));

  const tftNumber = await test.step('Open the telecom fulfillment task', () => requestedItemPage.openTelecomTask());

  await test.step(`TFT ${tftNumber} summary matches the order`, () =>
    tftPage.telecomValidation(tftNumber, requestNumber, order));

  await test.step('Change TFT state to In Progress', () => tftPage.changeStateToInProgress());

  await test.step('Change TFT state to With Carrier', () => tftPage.changeStateToWithCarrier());

  await test.step('Set TFT details and complete the task', () => tftPage.complete(tftDetails));

  await test.step(`Mobile device with IMEI ${tftDetails.imei} is created`, () =>
    mobileDevicePage.expectCreatedFor(tftDetails.imei, order));
});
