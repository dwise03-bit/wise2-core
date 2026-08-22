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
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    const subtotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    setOrderTotal(total);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const shipping = 5.00;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      const orderData = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        items: cartItems,
        notes: '',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      setOrderNumber(result.data.order_number);
      setOrderTotal(result.data.total);
      setOrderPlaced(true);
      localStorage.removeItem('cart');
    } catch (err: any) {
      setError(err.message || 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-cc-dark mb-2">Order #: <span className="font-bold">{orderNumber}</span></p>
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
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
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
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-cc-dark">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-cc-dark text-sm">No items in cart</div>
                )}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-cc-lavender">
                <div className="flex justify-between text-cc-dark">
                  <span>Subtotal:</span>
                  <span>${(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cc-dark">
                  <span>Shipping:</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between text-cc-dark">
                  <span>Tax:</span>
                  <span>${((cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)) * 0.08).toFixed(2)}</span>
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
