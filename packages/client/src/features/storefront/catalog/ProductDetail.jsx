import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api';

export default function ProductDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      const prod = res.data.data.product;
      setProduct(prod);
      if (prod.variants && prod.variants.length > 0) {
        setSelectedVariant(prod.variants[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch product details', err);
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleAddToCart = () => {
    // Save to cart in localStorage or context
    const cart = JSON.parse(localStorage.getItem('zb_cart') || '[]');
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: product.images?.[0] || '',
      variant: selectedVariant,
      quantity,
    };

    // Check if exact item already in cart
    const existingIndex = cart.findIndex(
      (item) => item.productId === product._id && JSON.stringify(item.variant) === JSON.stringify(selectedVariant)
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('zb_cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Product not found'}</h2>
        <Link to="/products" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
          Back to Products
        </Link>
      </div>
    );
  }

  const name = product.name?.[i18n.language] || product.name?.en || 'Product';
  const description = product.description?.[i18n.language] || product.description?.en || '';
  const category = typeof product.category === 'object' ? (product.category?.[i18n.language] || product.category?.en) : product.category;
  const currencySymbol = i18n.language === 'ne' ? 'रु ' : 'Rs. ';
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-blue-600">ZenithBazaar</Link>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
              <Link to="/products" className="hover:text-blue-600">{t('products')}</Link>
            </nav>
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

      {/* Main Product Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow">
        <div className="mb-6 text-sm text-gray-500 flex items-center space-x-2">
          <Link to="/products" className="hover:underline">Products</Link>
          <span>/</span>
          <span>{category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{name}</span>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="h-96 bg-gray-100 rounded-lg overflow-hidden border">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Options */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">{category}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>

              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">
                  {currencySymbol}{currentPrice.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {currencySymbol}{product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                {description}
              </div>

              {/* Vendor info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Sold by: </span>
                  <strong className="text-gray-800">{product.vendor?.storeName || product.vendor?.name || 'ZenithBazaar Store'}</strong>
                </div>
                <div className="text-xs">
                  {currentStock > 0 ? (
                    <span className="text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">In Stock ({currentStock} available)</span>
                  ) : (
                    <span className="text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Select Variant:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v, idx) => {
                      const isSelected = selectedVariant && selectedVariant.sku === v.sku;
                      const attrLabel = v.attributes ? Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ') : `Variant ${idx + 1}`;
                      return (
                        <button
                          key={v.sku || idx}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                          {attrLabel} - {currencySymbol}{v.price}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center space-x-4 mb-8">
                <label className="text-sm font-semibold text-gray-800">Quantity:</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-sm ${currentStock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {addedToCart && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-center text-sm rounded-lg animate-pulse">
                  Successfully added to cart!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500 mt-auto">
        &copy; 2026 ZenithBazaar. Single currency (NPR) & Bilingual product view.
      </footer>
    </div>
  );
}
