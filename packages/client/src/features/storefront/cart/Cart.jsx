import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';

export const Cart = ({ lang = 'en' }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      startShopping: 'Start Shopping',
      price: 'Price',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      clear: 'Clear Cart',
      summary: 'Order Summary',
    },
    ne: {
      title: 'खरीददारी कार्ट (Shopping Cart)',
      empty: 'तपाईको कार्ट खाली छ',
      startShopping: 'किनमेल सुरु गर्नुहोस्',
      price: 'मूल्य',
      quantity: 'मात्रा',
      subtotal: 'जम्मा',
      total: 'कुल जम्मा',
      checkout: 'चेकआउट तर्फ जानुहोस्',
      remove: 'हटाउनुहोस्',
      clear: 'कार्ट खाली गर्नुहोस्',
      summary: 'अर्डर सारांश',
    },
  };

  const t = translations[lang] || translations.en;

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/cart', {
        credentials: 'include',
      });
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

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch(`/api/v1/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.data.cart);
      } else {
        alert(data.message || 'Failed to update quantity');
      }
    } catch (err) {
      alert('Network error while updating quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`/api/v1/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.data.cart);
      } else {
        alert(data.message || 'Failed to remove item');
      }
    } catch (err) {
      alert('Network error while removing item');
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/v1/cart', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.data.cart);
      } else {
        alert(data.message || 'Failed to clear cart');
      }
    } catch (err) {
      alert('Network error while clearing cart');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.empty}</h2>
        <a
          href="/"
          className="inline-flex items-center mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {t.startShopping} <ArrowRight className="ml-2" size={18} />
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{t.title}</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
        >
          <Trash2 size={16} /> {t.clear}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const prodName = item.product?.name?.[lang] || item.product?.name?.en || 'Product';
            const imgUrl = item.product?.images?.[0] || 'https://via.placeholder.com/150';
            return (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={imgUrl}
                    alt={prodName}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{prodName}</h3>
                    {item.variantSku && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        SKU: {item.variantSku}
                      </span>
                    )}
                    <p className="text-blue-600 font-bold mt-1">NPR {item.priceAtAdd.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-semibold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-gray-950">
                      NPR {(item.priceAtAdd * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.summary}</h2>
          <div className="space-y-3 pb-4 border-b border-gray-200 text-gray-600">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="font-semibold text-gray-900">NPR {calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-4 font-bold text-lg text-gray-900">
            <span>{t.total}</span>
            <span className="text-blue-600">NPR {calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => alert('Proceeding to checkout (Phase 3 continuation)')}
            className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {t.checkout} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Cart;
