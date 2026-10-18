import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/admin/products/pending'),
      ]);
      setVendors(vRes.data.data.vendors);
      setPendingProducts(pRes.data.data.products);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVerify = async (vendorId, currentStatus) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/verify`, {
        isVerified: !currentStatus,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const handleModerateProduct = async (productId, status) => {
    try {
      await api.patch(`/admin/products/${productId}/moderate`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate product');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading admin data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Management Portal</h1>
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'vendors' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Products ({pendingProducts.length})
          </button>
        </div>
      </div>

      {activeTab === 'vendors' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Vendor Verification Queue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">Vendor Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vendor.profile?.firstName} {vendor.profile?.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        vendor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vendor.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleVerify(vendor._id, vendor.isVerified)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          vendor.isVerified
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {vendor.isVerified ? 'Revoke Verification' : 'Verify Vendor'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Product Moderation Queue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No pending products to moderate.
                    </td>
                  </tr>
                ) : (
                  pendingProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name?.en}</td>
                      <td className="px-6 py-4 text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">NPR {product.price}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleModerateProduct(product._id, 'approved')}
                          className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateProduct(product._id, 'rejected')}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
