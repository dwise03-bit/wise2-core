import { DemoFormPage } from '@/components/DemoFormPage';

export default function NewProductPage() {
  return (
    <DemoFormPage
      title="Add Product"
      subtitle="Add a new item to your boutique inventory"
      backHref="/inventory"
      fields={[
        { label: 'Product Name', placeholder: 'Cherry Bomb Hoodie' },
        { label: 'SKU', placeholder: 'CB-HOOD-001' },
        { label: 'Retail Price', placeholder: '70', type: 'number' },
        { label: 'Cost', placeholder: '28', type: 'number' },
      ]}
      submitLabel="Save Product"
      note="Demo preview — saves when live API is connected."
    />
  );
}
