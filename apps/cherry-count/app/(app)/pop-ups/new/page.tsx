import { DemoFormPage } from '@/components/DemoFormPage';

export default function NewPopUpPage() {
  return (
    <DemoFormPage
      title="Create Pop-Up"
      subtitle="Plan your next market, festival, or trunk show"
      backHref="/pop-ups"
      fields={[
        { label: 'Event Name', placeholder: 'Downtown Night Market' },
        { label: 'Venue', placeholder: 'City Center Plaza' },
        { label: 'Date', placeholder: '2026-09-06', type: 'date' },
        { label: 'Address', placeholder: '123 Main St, Atlanta, GA' },
      ]}
      submitLabel="Create Event"
      note="Demo preview — event planning saves when live API is connected."
    />
  );
}
