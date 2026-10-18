import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
          <h1 className="text-2xl font-bold text-gray-900">E-Commerce Marketplace</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {i18n.language === 'en' ? 'नेपाली' : 'English'}
            </button>
            <Link to="/login" className="text-blue-600 hover:underline">{t('login')}</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t('welcome')}</h2>
        <p className="text-lg text-gray-600">Single currency: {t('currency')} | Bilingual: English & Nepali</p>
      </main>
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        &copy; 2026 E-Commerce Marketplace. All rights reserved.
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
        <p className="text-center text-gray-500">Login form placeholder</p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
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
      </Routes>
    </BrowserRouter>
  );
}
