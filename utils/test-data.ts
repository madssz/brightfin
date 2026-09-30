
export function buildDeviceOrder(): DeviceOrder {
    return {
        provider: 'Verizon',
        providerOption: 'Verizon | Verizon Test',
        device: 'Samsung Galaxy S24+',
        deviceOption: 'Samsung Galaxy S24+ 230 USD',
        deviceFullName: 'Samsung Galaxy S24+ 512GB Onyx Black',
        accessory: 'Samsung Smart View Wallet Case for Galaxy S24+',
        locationSearch: '10065',
        location: '10065 East Harvard Avenue, Denver,CO',
        address: '10065 East Harvard Avenue, Denver',
        attentionTo: 'Denys Khorobchuk',
        contactNumber: '3035550123'
    };
}

export function formatDateMMddyyyy(date: Date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${date.getFullYear()}`;
}

export type DeviceOrder = {
    provider: string;
    providerOption: string;
    device: string;
    deviceOption: string;
    deviceFullName: string;
    accessory: string;
    locationSearch: string;
    location: string;
    address: string;
    attentionTo: string;
    contactNumber: string;
};

export function buildTftDetails(overrides: Partial<TftDetails> = {}): TftDetails {
    const imei = `${Date.now()}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    return {
        imei,
        orderNumber: `ORD-${imei.slice(-6)}`,
        shipmentDate: formatDateMMddyyyy(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        carrier: 'FedEx',
        trackingNumber: `TRK${imei.slice(-8)}`,
        priceDigits: '022999',
        ...overrides,
    };
}

export type TftDetails = {
    orderNumber: string;
    imei: string;
    shipmentDate: string;
    carrier: 'USPS' | 'FedEx' | 'Other';
    trackingNumber: string;
    priceDigits: string;
};

export const TftState = {
    InProgress: '2',
    WithCarrier: '-5',
    Completed: '3',
} as const;
