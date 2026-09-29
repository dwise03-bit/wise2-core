import { DemoFormPage } from '@/components/DemoFormPage';

export default function NewCustomerPage() {
  return (
    <DemoFormPage
      title="Add Customer"
      subtitle="Capture size, style, and contact info at the booth"
      backHref="/customers"
      fields={[
        { label: 'Name', placeholder: 'Brianna R.' },
        { label: 'Phone', placeholder: '(404) 555-0199' },
        { label: 'Instagram', placeholder: '@brianna.style' },
        { label: 'Preferred Size', placeholder: 'Medium' },
      ]}
      submitLabel="Save Customer"
      note="Demo preview — CRM syncs when authenticated."
    />
  );
}
