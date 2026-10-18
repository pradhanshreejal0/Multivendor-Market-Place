import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useTranslation } from 'react-i18next';

export default function VendorOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingInput, setTrackingInput] = useState({});

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/vendor');
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleStatusUpdate = async (orderId, subOrderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/sub-orders/${subOrderId}/status`, {
        status: newStatus,
      });
      // Refresh orders
      fetchVendorOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Orders Fulfillment</h1>
        <button
          onClick={fetchVendorOrders}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          No orders found for your store yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order ID</span>
                  <p className="text-sm font-mono font-medium text-gray-900">{order._id}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Placed At</span>
                  <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Payment</span>
                  <p className="text-sm font-medium text-gray-900">
                    {order.paymentMethod} ({order.paymentStatus})
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Shipping Address */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</h4>
                  <p className="text-sm text-gray-800">
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </p>
                </div>

                {/* Sub-Orders list for this vendor */}
                <div className="space-y-4">
                  {order.subOrders?.map((subOrder) => (
                    <div key={subOrder._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-gray-900">Sub-Order Status:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            subOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            subOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            subOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subOrder.status}
                          </span>
                        </div>

                        {/* Status Actions */}
                        <div className="flex items-center space-x-2">
                          <select
                            value={subOrder.status}
                            onChange={(e) => handleStatusUpdate(order._id, subOrder._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-gray-200">
                        {subOrder.items?.map((item, idx) => (
                          <div key={idx} className="py-2 flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">
                                {item.product?.name?.en || 'Product'}
                              </span>
                              <span className="text-gray-500">x {item.quantity}</span>
                              {item.variantSku && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                                  SKU: {item.variantSku}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">NPR {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-medium">
                        <span className="text-gray-600">Subtotal (incl. shipping NPR {subOrder.shippingFee}):</span>
                        <span className="text-blue-600 font-bold">NPR {subOrder.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
