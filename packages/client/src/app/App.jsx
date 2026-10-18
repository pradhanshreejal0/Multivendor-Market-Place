import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VendorLayout from '../features/vendor/VendorLayout';
import ProductList from '../features/vendor/products/ProductList';
import ProductForm from '../features/vendor/products/ProductForm';
import VendorOrders from '../features/vendor/orders/VendorOrders';
import VendorReports from '../features/vendor/reports/VendorReports';
import AdminVendors from '../features/admin/vendors/AdminVendors';
import AdminPayouts from '../features/admin/payouts/AdminPayouts';
import LayoutEditor from '../features/editor/LayoutEditor';
import ProductListing from '../features/storefront/catalog/ProductListing';
import ProductDetail from '../features/storefront/catalog/ProductDetail';
import SearchResults from '../features/storefront/catalog/SearchResults';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ZenithBazaar</h1>
          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-blue-600 hover:underline font-medium">{t('products')}</Link>
            <Link to="/login" className="text-blue-600 hover:underline">{t('login')}</Link>
            <Link to="/vendor/products" className="text-blue-600 hover:underline font-medium">Vendor Portal</Link>
            <Link to="/admin/vendors" className="text-purple-600 hover:underline font-medium">Admin Portal</Link>
            <Link to="/admin/editor" className="text-green-600 hover:underline font-medium">Layout Editor</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('welcome')}</h2>
        <p className="text-lg text-gray-600">Currency: {t('currency')} | English (Single Language)</p>
        <div className="mt-8 flex justify-center space-x-4 flex-wrap gap-4">
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Browse Storefront Catalog
          </Link>
          <Link
            to="/vendor/products"
            className="inline-block bg-gray-900 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition"
          >
            Vendor Management
          </Link>
          <Link
            to="/admin/vendors"
            className="inline-block bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/admin/editor"
            className="inline-block bg-green-600 text-white font-medium px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Homepage Layout Editor
          </Link>
        </div>
      </main>
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        &copy; 2026 ZenithBazaar. All rights reserved.
      </footer>
    </div>
  );
}

function Login() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login')}</h2>
        <p className="text-center text-gray-500 mb-4">Authentication / Portal Access</p>
        <div className="space-y-4">
          <div className="text-center">
            <Link to="/products" className="text-blue-600 hover:underline font-medium">Go to Storefront Products</Link>
          </div>
          <div className="text-center">
            <Link to="/vendor/products" className="text-blue-600 hover:underline font-medium">Bypass to Vendor Portal</Link>
          </div>
          <div className="text-center">
            <Link to="/admin/vendors" className="text-purple-600 hover:underline font-medium">Bypass to Admin Dashboard</Link>
          </div>
          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Storefront Catalog & Search Routes */}
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Vendor Routes */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="reports" element={<VendorReports />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
        <Route path="/admin/editor" element={<LayoutEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
