'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomOrder() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    penColor: 'navy',
    topper: 'crystal',
    theme: 'classic',
    personalization: '',
    quantity: 1,
    notes: '',
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const penColors = [
    { id: 'navy', name: 'Deep Navy', hex: '#0a1f3d' },
    { id: 'blue', name: 'Electric Blue', hex: '#0066ff' },
    { id: 'cyan', name: 'Cyan Glow', hex: '#00d4ff' },
    { id: 'silver', name: 'Chrome Silver', hex: '#e8e8e8' },
  ];

  const toppers = [
    { id: 'crystal', name: 'Crystal', price: 3 },
    { id: 'bead', name: 'Bead Chain', price: 4 },
    { id: 'charm', name: 'Charm', price: 2 },
    { id: 'plain', name: 'Plain', price: 0 },
  ];

  const themes = [
    { id: 'classic', name: 'Classic', price: 0 },
    { id: 'luxury', name: 'Luxury Gold', price: 5 },
    { id: 'neon', name: 'Neon Glow', price: 6 },
    { id: 'minimal', name: 'Minimal', price: 0 },
  ];

  const basePrice = 12.99;
  const topperPrice = toppers.find(t => t.id === formData.topper)?.price || 0;
  const themePrice = themes.find(t => t.id === formData.theme)?.price || 0;
  const totalPrice = (basePrice + topperPrice + themePrice) * formData.quantity;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Save to localStorage for demo
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = {
        id: `ORD-${Date.now()}`,
        ...formData,
        totalPrice,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Update customer count
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const existingCustomer = customers.find((c: any) => c.email === formData.email);
      if (!existingCustomer) {
        customers.push({
          id: `CUST-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          vipStatus: false,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('customers', JSON.stringify(customers));
      }

      setSubmitted(true);
      setTimeout(() => router.push('/order-confirmation?id=' + newOrder.id), 2000);
    }
  };

  if (submitted) {
    return (
      <div className="bg-navy min-h-screen flex items-center justify-center p-4">
        <div className="bg-navy-light rounded-lg p-12 text-center border border-cyan max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-cyan mb-4">Order Submitted!</h1>
          <p className="text-white mb-2">Your custom pen order has been received.</p>
          <p className="text-silver-dark text-sm mb-6">Redirecting to confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-navy min-h-screen text-white p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="text-cyan hover:text-cyan-glow transition mb-6 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Design Your Custom Pen</h1>
        <p className="text-silver-dark">Step {step} of 3</p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded ${s <= step ? 'bg-cyan' : 'bg-navy-light'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Add Personal Message</label>
                  <textarea
                    name="personalization"
                    value={formData.personalization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                    placeholder="E.g., 'To Sarah, 2024'"
                    rows={3}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-4">Pen Color</label>
                  <div className="grid grid-cols-2 gap-3">
                    {penColors.map(color => (
                      <label key={color.id} className="flex items-center gap-3 p-3 rounded border border-navy-light cursor-pointer hover:border-cyan transition" style={{borderColor: formData.penColor === color.id ? '#00d4ff' : undefined}}>
                        <input
                          type="radio"
                          name="penColor"
                          value={color.id}
                          checked={formData.penColor === color.id}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <div className="w-6 h-6 rounded" style={{backgroundColor: color.hex}} />
                        <span>{color.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-4">Topper</label>
                  <div className="grid grid-cols-2 gap-3">
                    {toppers.map(topper => (
                      <label key={topper.id} className="flex items-center gap-3 p-3 rounded border border-navy-light cursor-pointer hover:border-cyan transition" style={{borderColor: formData.topper === topper.id ? '#00d4ff' : undefined}}>
                        <input
                          type="radio"
                          name="topper"
                          value={topper.id}
                          checked={formData.topper === topper.id}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span>{topper.name}</span>
                        {topper.price > 0 && <span className="text-cyan text-sm">+${topper.price}</span>}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-4">Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(theme => (
                      <label key={theme.id} className="flex items-center gap-3 p-3 rounded border border-navy-light cursor-pointer hover:border-cyan transition" style={{borderColor: formData.theme === theme.id ? '#00d4ff' : undefined}}>
                        <input
                          type="radio"
                          name="theme"
                          value={theme.id}
                          checked={formData.theme === theme.id}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span>{theme.name}</span>
                        {theme.price > 0 && <span className="text-cyan text-sm">+${theme.price}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2">Quantity</label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                  >
                    {[1, 2, 3, 5, 10, 25, 50].map(qty => (
                      <option key={qty} value={qty}>{qty} {qty === 1 ? 'pen' : 'pens'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Special Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-light rounded border border-navy-light focus:border-cyan outline-none text-white"
                    placeholder="Any special requests or instructions..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-cyan hover:bg-cyan/10 rounded transition"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue hover:bg-blue-light rounded font-bold transition"
              >
                {step === 3 ? 'Submit Order' : 'Next'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="sticky top-4 h-fit">
          <div className="bg-navy-light rounded-lg p-8 border border-navy-light">
            <h3 className="text-lg font-bold mb-6 text-cyan">Order Summary</h3>

            <div className="mb-6 p-4 bg-navy rounded text-center">
              <div className="text-6xl mb-2">✒️</div>
              <p className="text-sm text-silver-dark">Your custom pen</p>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-navy">
              {formData.name && <div className="flex justify-between"><span className="text-silver-dark">Name:</span><span>{formData.name}</span></div>}
              {formData.email && <div className="flex justify-between"><span className="text-silver-dark">Email:</span><span className="text-cyan">{formData.email}</span></div>}
              {step >= 2 && <div className="flex justify-between"><span className="text-silver-dark">Color:</span><span className="capitalize">{formData.penColor}</span></div>}
              {step >= 2 && <div className="flex justify-between"><span className="text-silver-dark">Topper:</span><span className="capitalize">{formData.topper}</span></div>}
              {step >= 2 && <div className="flex justify-between"><span className="text-silver-dark">Theme:</span><span className="capitalize">{formData.theme}</span></div>}
              {step >= 3 && <div className="flex justify-between"><span className="text-silver-dark">Quantity:</span><span>{formData.quantity}</span></div>}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Base Pen</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {topperPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Topper</span>
                  <span>${topperPrice.toFixed(2)}</span>
                </div>
              )}
              {themePrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Theme</span>
                  <span>${themePrice.toFixed(2)}</span>
                </div>
              )}
              {formData.quantity > 1 && (
                <div className="flex justify-between text-sm">
                  <span>×{formData.quantity}</span>
                  <span></span>
                </div>
              )}
            </div>

            <div className="bg-blue/10 rounded p-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-cyan">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
