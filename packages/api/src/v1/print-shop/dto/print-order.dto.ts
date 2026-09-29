export class CreateOrderItemDto {
  name!: string;
  description?: string;
  quantity!: number;
  unitPrice?: number;
  productId?: string;
  material?: string;
  color?: string;
}

export class CreateOrderDto {
  customerName!: string;
  customerEmail!: string;
  customerPhone?: string;
  orderType?: string;
  items!: CreateOrderItemDto[];
  notes?: string;
}

export class UpdateOrderStatusDto {
  status!: string;
}
