export type Entitlement = {
  active: boolean;
  productId?: string;
  expiresAt?: string;
  source: 'mock' | 'revenuecat';
};

export type Offering = {
  packageId: string;
  title: string;
  priceLabel: string;
  period: 'monthly' | 'yearly';
};

export interface PurchaseProvider {
  init(): Promise<void>;
  getOfferings(): Promise<Offering[]>;
  purchase(packageId: string): Promise<Entitlement>;
  restore(): Promise<Entitlement>;
  getEntitlement(): Promise<Entitlement>;
}

export const OFFERINGS: Offering[] = [
  { packageId: 'yearly_99', title: 'Yearly', priceLabel: '$99/yr', period: 'yearly' },
  { packageId: 'monthly_1499', title: 'Monthly', priceLabel: '$14.99/mo', period: 'monthly' },
];
