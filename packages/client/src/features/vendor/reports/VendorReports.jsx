import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function VendorReports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/vendor');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Failed to fetch reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sales reports...</div>;
  }

  // Calculate metrics
  let totalRevenue = 0;
  let totalOrdersCount = orders.length;
  let deliveredCount = 0;
  let pendingCount = 0;

  orders.forEach((order) => {
    order.subOrders?.forEach((so) => {
      totalRevenue += so.totalAmount || 0;
      if (so.status === 'delivered') deliveredCount++;
      if (so.status === 'pending') pendingCount++;
    });
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vendor Sales Reports & Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">NPR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalOrdersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Delivered Sub-Orders</p>
          <p className="text-3xl font-extrabold text-green-600 mt-2">{deliveredCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Pending Sub-Orders</p>
          <p className="text-3xl font-extrabold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
      </div>

      {/* Recent Orders table summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Order Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) =>
                order.subOrders?.map((so) => (
                  <tr key={so._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-900">{order._id}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase">
                        {so.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">NPR {so.totalAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
