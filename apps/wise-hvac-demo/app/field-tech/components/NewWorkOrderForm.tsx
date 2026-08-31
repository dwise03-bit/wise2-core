'use client';

import { useState } from 'react';

export function NewWorkOrderForm({
  onCreate,
  onCancel,
}: {
  onCreate: (input: { customerName: string; customerPhone: string; address: string; complaint: string }) => void;
  onCancel?: () => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [complaint, setComplaint] = useState('');

  return (
    <section className="imp-panel">
      <h2>NEW CALL</h2>
      <p className="imp-empty" style={{ textAlign: 'left' }}>
        Create the work order on this phone. It stays on device until dispatch sync is available.
      </p>
      <input className="wise-input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name" autoComplete="name" />
      <input className="wise-input" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Phone" inputMode="tel" autoComplete="tel" />
      <input className="wise-input" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Job site address" autoComplete="street-address" />
      <textarea className="wise-input" value={complaint} onChange={(event) => setComplaint(event.target.value)} placeholder="Complaint / dispatch notes" />
      <button
        type="button"
        className="imp-primary"
        disabled={!customerName.trim()}
        onClick={() => {
          onCreate({ customerName, customerPhone, address, complaint });
          setCustomerName('');
          setCustomerPhone('');
          setAddress('');
          setComplaint('');
        }}
      >
        CREATE WORK ORDER
      </button>
      {onCancel ? (
        <button type="button" className="imp-ghost-btn" onClick={onCancel}>CANCEL</button>
      ) : null}
    </section>
  );
}
