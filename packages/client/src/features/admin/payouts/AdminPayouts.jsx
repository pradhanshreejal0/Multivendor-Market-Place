import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payouts');
      setPayouts(res.data.data.payouts);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcess = async (payoutId) => {
    try {
      await api.post(`/admin/payouts/${payoutId}/process`);
      fetchPayouts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payout');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Payout Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Vendor Payout Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-3">Vendor / Store</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {payouts.map((payout) => (
                <tr key={payout._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{payout.storeName}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">NPR {payout.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      payout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payout.status === 'pending' ? (
                      <button
                        onClick={() => handleProcess(payout._id)}
                        className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-medium"
                      >
                        Process Payout
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
