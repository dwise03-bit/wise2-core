export class CreateProductDto {
  name!: string;
  description!: string;
  categoryId!: string;
  basePrice!: number;
  imageUrl?: string;
  tags?: string[];
  specifications?: Record<string, any>;
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  categoryId?: string;
  basePrice?: number;
  imageUrl?: string;
  tags?: string[];
  specifications?: Record<string, any>;
}
