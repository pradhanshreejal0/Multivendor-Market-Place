import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VendorLayout from '../features/vendor/VendorLayout';
import ProductList from '../features/vendor/products/ProductList';
import ProductForm from '../features/vendor/products/ProductForm';
import ProductListing from '../features/storefront/catalog/ProductListing';
import ProductDetail from '../features/storefront/catalog/ProductDetail';
import SearchResults from '../features/storefront/catalog/SearchResults';

function Home() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ZenithBazaar</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {i18n.language === 'en' ? 'नेपाली' : 'English'}
            </button>
            <Link to="/products" className="text-blue-600 hover:underline font-medium">{t('products')}</Link>
            <Link to="/login" className="text-blue-600 hover:underline">{t('login')}</Link>
            <Link to="/vendor/products" className="text-blue-600 hover:underline font-medium">Vendor Portal</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('welcome')}</h2>
        <p className="text-lg text-gray-600">Single currency: {t('currency')} | Bilingual: English & Nepali</p>
        <div className="mt-8 flex justify-center space-x-4">
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
            Vendor Product Management
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
        <p className="text-center text-gray-500 mb-4">Login form placeholder / Authentication</p>
        <div className="space-y-4">
          <div className="text-center">
            <Link to="/products" className="text-blue-600 hover:underline font-medium">Go to Storefront Products</Link>
          </div>
          <div className="text-center">
            <Link to="/vendor/products" className="text-blue-600 hover:underline font-medium">Bypass to Vendor Products (Dev Mode)</Link>
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
          <Route path="orders" element={<div className="p-8 text-center text-gray-500">Vendor Orders Management (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
