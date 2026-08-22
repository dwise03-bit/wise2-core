export class CreateQuoteDto {
  customerName!: string;
  customerEmail!: string;
  lineItems!: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  shippingCost?: number;
  taxRate?: number;
}

export class UpdateQuoteStatusDto {
  status!: string;
  reason?: string;
}
