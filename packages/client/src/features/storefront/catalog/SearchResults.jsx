import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api';

export default function SearchResults() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams.entries()]);
      const res = await api.get('/products', { params });
      setProducts(res.data.data.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch search results', err);
      setError('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currencySymbol = i18n.language === 'ne' ? 'रु ' : 'Rs. ';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-blue-600">ZenithBazaar</Link>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
              <Link to="/products" className="hover:text-blue-600">{t('products')}</Link>
            </nav>
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex">
            <input
              type="text"
              placeholder={i18n.language === 'ne' ? 'उत्पादनहरू खोज्नुहोस्...' : 'Search products...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-r-lg hover:bg-blue-700 text-sm font-medium"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {i18n.language === 'en' ? 'नेपाली' : 'English'}
            </button>
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">{t('login')}</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-grow">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results for "{searchQuery}"
          </h1>
          <p className="text-sm text-gray-500 mt-1">Found {products.length} products matching your query.</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Searching products...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border shadow-sm p-12">
            <h3 className="text-lg font-bold text-gray-800 mb-2">No results found for "{searchQuery}"</h3>
            <p className="text-gray-500 text-sm mb-6">Check your spelling or try searching for something else.</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const name = product.name?.[i18n.language] || product.name?.en || 'Product';
              const category = typeof product.category === 'object' ? (product.category?.[i18n.language] || product.category?.en) : product.category;

              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition flex flex-col overflow-hidden group"
                >
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">{name}</h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-lg">
                        {currencySymbol}{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.vendor?.storeName || 'ZenithBazaar'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500 mt-auto">
        &copy; 2026 ZenithBazaar. Single currency (NPR) & Bilingual search.
      </footer>
    </div>
  );
}
