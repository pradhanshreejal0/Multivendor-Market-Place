import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api';

export default function ProductListing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1 });

  // Filters from searchParams
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page')) || 1;

  // Local state for search input
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries([...searchParams.entries()]);
      params.limit = params.limit || 12;
      const res = await api.get('/products', { params });
      setProducts(res.data.data.products || []);
      setPagination(res.data.pagination || { page: 1, limit: 12, totalPages: 1 });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete suggestions as user types search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim().length >= 2) {
        try {
          const res = await api.get('/products', { params: { search: searchInput, limit: 5 } });
          setSuggestions(res.data.data.products || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === selectedCategory) {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const min = formData.get('minPrice');
    const max = formData.get('maxPrice');
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min); else newParams.delete('minPrice');
    if (max) newParams.set('maxPrice', max); else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-blue-600">ZenithBazaar</Link>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
              <Link to="/products" className="text-blue-600 font-semibold">{t('products')}</Link>
              <Link to="/vendor/products" className="hover:text-blue-600">Vendor Portal</Link>
            </nav>
          </div>

          {/* Search bar with autocomplete */}
          <div className="relative w-full md:w-96">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder={i18n.language === 'ne' ? 'उत्पादनहरू खोज्नुहोस्...' : 'Search products...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => searchInput.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-r-lg hover:bg-blue-700 text-sm font-medium"
              >
                Search
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => {
                      setShowSuggestions(false);
                      navigate(`/products/${prod._id}`);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {prod.images?.[0] && (
                      <img src={prod.images[0]} alt="" className="w-8 h-8 object-cover rounded mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{prod.name?.[i18n.language] || prod.name?.en}</div>
                      <div className="text-gray-500 text-xs">Rs. {prod.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 bg-white p-6 rounded-lg shadow-sm border h-fit space-y-6">
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-3">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-2 py-1 rounded ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat, idx) => {
                const catName = typeof cat === 'object' ? (cat[i18n.language] || cat.en) : cat;
                return (
                  <li key={idx}>
                    <button
                      onClick={() => handleCategorySelect(catName)}
                      className={`w-full text-left px-2 py-1 rounded ${selectedCategory === catName ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {catName}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <hr />

          {/* Price Range Filter */}
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-3">Price Range ({i18n.language === 'ne' ? 'रु' : 'Rs.'})</h3>
            <form onSubmit={handlePriceFilter} className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={minPrice}
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-1.5 rounded hover:bg-gray-800 font-medium text-xs uppercase tracking-wider"
              >
                Apply Filter
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid & Controls */}
        <main className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> products
              {selectedCategory && <span> in <strong className="text-blue-600">{selectedCategory}</strong></span>}
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <label htmlFor="sort" className="text-gray-600 font-medium">Sort by:</label>
              <select
                id="sort"
                value={sort}
                onChange={handleSortChange}
                className="border px-3 py-1.5 rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading products...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-lg border shadow-sm p-12">
              <h3 className="text-lg font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const name = product.name?.[i18n.language] || product.name?.en || 'Product';
                const category = typeof product.category === 'object' ? (product.category?.[i18n.language] || product.category?.en) : product.category;
                const currencySymbol = i18n.language === 'ne' ? 'रु ' : 'Rs. ';

                return (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition flex flex-col overflow-group group"
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
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">{name}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-lg">
                            {currencySymbol}{product.price.toLocaleString()}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {currencySymbol}{product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
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

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-4 py-2 rounded text-sm font-medium ${p === pagination.page ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500 mt-auto">
        &copy; 2026 ZenithBazaar. Single currency (NPR) & Bilingual storefront.
      </footer>
    </div>
  );
}
