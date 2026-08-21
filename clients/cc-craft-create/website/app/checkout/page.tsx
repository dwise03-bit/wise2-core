'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      setOrderPlaced(true);
    }, 1500);
  };

  const orderTotal = 139.96; // Placeholder

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="text-4xl font-lora font-bold text-cc-purple mb-4">Order Confirmed!</h1>
            <p className="text-lg text-cc-dark mb-8">
              Thank you for your order. You'll receive an email confirmation shortly.
            </p>
            <div className="bg-cc-lilac rounded-lg p-8 mb-8">
              <p className="text-cc-dark mb-2">Order #: <span className="font-bold">CC-20260821-001</span></p>
              <p className="text-cc-dark mb-4">Total: <span className="font-bold text-cc-gold text-lg">${orderTotal.toFixed(2)}</span></p>
              <p className="text-sm text-cc-dark">Expected delivery: 5-7 business days</p>
            </div>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-cc-lilac py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-lora font-bold text-cc-dark">Checkout</h1>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Info */}
                <section>
                  <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">
                    Customer Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="col-span-1 px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="col-span-1 px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple mb-4"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                    required
                  />
                </section>

                {/* Shipping Address */}
                <section>
                  <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">
                    Shipping Address
                  </h2>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple mb-4"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="zip"
                    placeholder="ZIP Code"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple mt-4"
                    required
                  />
                </section>

                {/* Payment */}
                <section>
                  <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">
                    Payment Method
                  </h2>
                  <input
                    type="text"
                    name="cardName"
                    placeholder="Name on Card"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple mb-4"
                    required
                  />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number (demo: 4242 4242 4242 4242)"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple mb-4"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      className="px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                    <input
                      type="text"
                      name="cardCvc"
                      placeholder="CVC"
                      value={formData.cardCvc}
                      onChange={handleChange}
                      className="px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                      required
                    />
                  </div>
                </section>

                <Button
                  type="submit"
                  className="w-full text-lg"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-cc-lilac rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-cc-lavender">
                <div className="flex justify-between text-cc-dark">
                  <span>Personalized Drink Labels × 2</span>
                  <span>$49.98</span>
                </div>
                <div className="flex justify-between text-cc-dark">
                  <span>Custom Party Package × 1</span>
                  <span>$89.99</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-cc-lavender">
                <div className="flex justify-between text-cc-dark">
                  <span>Subtotal:</span>
                  <span>$139.97</span>
                </div>
                <div className="flex justify-between text-cc-dark">
                  <span>Shipping:</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between text-cc-dark">
                  <span>Tax:</span>
                  <span>$14.99</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-cc-dark">Total:</span>
                <span className="font-bold text-cc-gold text-lg">${orderTotal.toFixed(2)}</span>
              </div>

              <p className="text-xs text-cc-dark text-center">
                🔒 Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
