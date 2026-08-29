export interface CreateProductInput {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category?: string;
  collection?: string;
  vendor?: string;
  cost?: number;
  retailPrice: number;
  salePrice?: number;
  images?: string[];
  tags?: string[];
  variants?: CreateVariantInput[];
}

export interface CreateVariantInput {
  size?: string;
  color?: string;
  material?: string;
  edition?: string;
  quantity?: number;
  minimumStock?: number;
  reorderPoint?: number;
  bin?: string;
  rack?: string;
  shelf?: string;
  tote?: string;
  storageLocation?: string;
}

export interface AdjustInventoryInput {
  variantId: string;
  quantityDelta: number;
  type: string;
  reason?: string;
  referenceId?: string;
}

export interface CreateContainerInput {
  name: string;
  type?: string;
  color?: string;
  description?: string;
  location?: string;
}

export interface CreateEventInput {
  name: string;
  date: string;
  venue: string;
  address?: string;
  arrivalTime?: string;
  setupTime?: string;
  notes?: string;
  expectedAttendance?: number;
  revenueGoal?: number;
}

export interface AssignEventInventoryInput {
  variantId: string;
  quantityAssigned: number;
}

export interface UpdatePackingInput {
  variantId: string;
  quantityPacked?: number;
  packingStatus?: string;
}

export interface CreateSaleInput {
  eventId?: string;
  customerId?: string;
  paymentMethod: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
  tax?: number;
  notes?: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  instagram?: string;
  preferredSize?: string;
  favoriteColors?: string[];
  notes?: string;
}
