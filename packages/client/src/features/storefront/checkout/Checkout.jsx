import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, Truck, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export const Checkout = ({ lang = 'en', onOrderSuccess }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Kathmandu',
    state: 'Bagmati',
    postalCode: '44600',
    country: 'Nepal',
    paymentMethod: 'COD',
  });

  const translations = {
    en: {
      title: 'Checkout',
      shippingAddress: 'Shipping Address',
      fullName: 'Full Name',
      phone: 'Phone Number',
      street: 'Street Address',
      city: 'City',
      state: 'State / Province',
      postalCode: 'Postal Code',
      country: 'Country',
      paymentMethod: 'Payment Method',
      cod: 'Cash on Delivery (COD)',
      esewa: 'eSewa Digital Wallet',
      khalti: 'Khalti Digital Wallet',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping (Multi-vendor)',
      total: 'Total Amount',
      placeOrder: 'Place Order',
      processing: 'Processing Order...',
      successTitle: 'Order Placed Successfully!',
      successSub: 'Your order has been split and forwarded to the respective vendors.',
      viewOrders: 'View My Orders',
    },
    ne: {
      title: 'चेकआउट (Checkout)',
      shippingAddress: 'डेलिभरी ठेगाना',
      fullName: 'पूरा नाम',
      phone: 'फोन नम्बर',
      street: 'सडक ठेगाना',
      city: 'शहर',
      state: 'प्रदेश',
      postalCode: 'पिन कोड',
      country: 'देश',
      paymentMethod: 'भुक्तानी विधि',
      cod: 'डेलिभरीको समयमा नगद (COD)',
      esewa: 'ई-सेवा (eSewa)',
      khalti: 'खल्ती (Khalti)',
      orderSummary: 'अर्डर सारांश',
      subtotal: 'जम्मा',
      shipping: 'ढुवानी शुल्क (बहु-विक्रेता)',
      total: 'कुल रकम',
      placeOrder: 'अर्डर कन्फर्म गर्नुहोस्',
      processing: 'अर्डर प्रक्रियामा छ...',
      successTitle: 'अर्डर सफलतापुर्वक राखियो!',
      successSub: 'तपाईको अर्डर विभाजित गरी सम्बन्धित विक्रेताहरूलाई पठाइएको छ।',
      viewOrders: 'मेरा अर्डरहरू हेर्नुहोस्',
    },
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/cart', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setCart(data.data.cart);
        } else {
          setError(data.message || 'Failed to load cart');
        }
      } catch (err) {
        setError('Network error while loading cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  };

  // Estimate shipping: NPR 150 per distinct vendor
  const calculateShipping = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    const vendors = new Set(cart.items.map((item) => item.product?.vendor?.toString() || item.product?.vendor));
    return vendors.size * 150;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          paymentMethod: formData.paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessOrder(data.data.order);
      } else {
        setError(data.message || 'Checkout failed');
      }
    } catch (err) {
      setError('Network error during checkout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading checkout...</div>;
  }

  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-green-100 rounded-full mb-6 text-green-600">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t.successTitle}</h2>
        <p className="text-gray-600 mb-6">{t.successSub}</p>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left mb-6">
          <p className="font-semibold text-gray-800 mb-2">Order ID: {successOrder._id}</p>
          <p className="text-sm text-gray-600 mb-1">Total Amount: NPR {successOrder.totalAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Payment Method: {successOrder.paymentMethod}</p>
        </div>
        <button
          onClick={() => (onOrderSuccess ? onOrderSuccess() : (window.location.href = '/'))}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {t.viewOrders} <ArrowRight className="ml-2" size={18} />
        </button>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Return to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t.title}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" /> {t.shippingAddress}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ram Bahadur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9841234567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.street}</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Durbar Marg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.city}</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.state}</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.postalCode}</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.country}</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" /> {t.paymentMethod}
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-800">{t.cod}</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="esewa"
                  checked={formData.paymentMethod === 'esewa'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-800">{t.esewa}</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khalti"
                  checked={formData.paymentMethod === 'khalti'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-800">{t.khalti}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.orderSummary}</h2>
          <div className="space-y-3 pb-4 border-b border-gray-200 text-gray-600">
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="truncate max-w-[180px]">
                  {item.product?.name?.[lang] || item.product?.name?.en} x {item.quantity}
                </span>
                <span className="font-medium">NPR {(item.priceAtAdd * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="py-4 space-y-2 border-b border-gray-200 text-gray-600">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="font-semibold text-gray-900">NPR {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.shipping}</span>
              <span className="font-semibold text-gray-900">NPR {calculateShipping().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 font-bold text-lg text-gray-900">
            <span>{t.total}</span>
            <span className="text-blue-600">NPR {calculateTotal().toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? t.processing : t.placeOrder} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
export default Checkout;
