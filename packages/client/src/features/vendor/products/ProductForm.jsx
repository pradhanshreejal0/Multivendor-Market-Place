import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../../lib/api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: { en: '', ne: '' },
    description: { en: '', ne: '' },
    category: { en: '', ne: '' },
    price: '',
    compareAtPrice: '',
    stock: '',
    images: [''],
    tags: '',
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/products/${id}`);
          const p = response.data.data.product;
          setFormData({
            name: { en: p.name?.en || '', ne: p.name?.ne || '' },
            description: { en: p.description?.en || '', ne: p.description?.ne || '' },
            category: { en: p.category?.en || '', ne: p.category?.ne || '' },
            price: p.price ?? '',
            compareAtPrice: p.compareAtPrice ?? '',
            stock: p.stock ?? '',
            images: p.images?.length > 0 ? p.images : [''],
            tags: p.tags?.join(', ') || '',
            variants: p.variants?.map(v => ({
              sku: v.sku || '',
              price: v.price ?? '',
              stock: v.stock ?? '',
              attributes: v.attributes ? Object.entries(v.attributes).map(([k, val]) => ({ key: k, value: val })) : []
            })) || [],
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load product');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLangChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Variant management
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { sku: '', price: '', stock: '', attributes: [{ key: 'Size', value: '' }] }],
    }));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addVariantAttribute = (vIndex) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].attributes.push({ key: '', value: '' });
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const updateVariantAttribute = (vIndex, attrIndex, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].attributes[attrIndex][field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeVariantAttribute = (vIndex, attrIndex) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].attributes = newVariants[vIndex].attributes.filter((_, i) => i !== attrIndex);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Format payload
      const payload = {
        name: {
          en: formData.name.en.trim(),
          ne: formData.name.ne.trim(),
        },
        description: {
          en: formData.description.en.trim(),
          ne: formData.description.ne.trim(),
        },
        category: {
          en: formData.category.en.trim(),
          ne: formData.category.ne.trim(),
        },
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock || 0),
        images: formData.images.filter((img) => img.trim() !== ''),
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        variants: formData.variants.map((v) => {
          const attributesObj = {};
          v.attributes.forEach((attr) => {
            if (attr.key.trim() && attr.value.trim()) {
              attributesObj[attr.key.trim()] = attr.value.trim();
            }
          });
          return {
            sku: v.sku.trim(),
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: attributesObj,
          };
        }),
      };

      if (isEditing) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      navigate('/vendor/products');
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || 'Failed to save product. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-gray-500">Loading product details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500">Provide product info, multilingual translations, pricing, and variants.</p>
        </div>
        <Link
          to="/vendor/products"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Products
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information & Multilingual */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Basic Information</h2>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name.en}
                onChange={(e) => handleLangChange('name', 'en', e.target.value)}
                placeholder="e.g. Pashmina Wool Shawl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name (Nepali)</label>
              <input
                type="text"
                value={formData.name.ne}
                onChange={(e) => handleLangChange('name', 'ne', e.target.value)}
                placeholder="e.g. पश्मीना ऊनको सल"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (English) *</label>
              <textarea
                required
                rows="4"
                value={formData.description.en}
                onChange={(e) => handleLangChange('description', 'en', e.target.value)}
                placeholder="Detailed description in English..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Nepali)</label>
              <textarea
                rows="4"
                value={formData.description.ne}
                onChange={(e) => handleLangChange('description', 'ne', e.target.value)}
                placeholder="नेपालीमा विस्तृत विवरण..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (English) *</label>
              <input
                type="text"
                required
                value={formData.category.en}
                onChange={(e) => handleLangChange('category', 'en', e.target.value)}
                placeholder="e.g. Clothing"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (Nepali)</label>
              <input
                type="text"
                value={formData.category.ne}
                onChange={(e) => handleLangChange('category', 'ne', e.target.value)}
                placeholder="e.g. लुगाफाटा"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Pricing & Inventory (NPR)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="1500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price (NPR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleChange}
                placeholder="2000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Stock *</label>
              <input
                type="number"
                required
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="pashmina, handmade, wool, winter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Product Images (URLs)</h2>
            <button
              type="button"
              onClick={addImageField}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              + Add Image URL
            </button>
          </div>

          <div className="space-y-3">
            {formData.images.map((imgUrl, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants Builder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
              <p className="text-xs text-gray-500">Add SKUs, specific prices, stock, and attributes (e.g. Size, Color).</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition"
            >
              + Add Variant
            </button>
          </div>

          {formData.variants.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No variants added yet. Click "+ Add Variant" if this product has sizes, colors, etc.</p>
          ) : (
            <div className="space-y-6">
              {formData.variants.map((v, vIndex) => (
                <div key={vIndex} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Variant #{vIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete Variant
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
                      <input
                        type="text"
                        required
                        value={v.sku}
                        onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                        placeholder="e.g. SHAWL-RED-L"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (NPR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => updateVariant(vIndex, 'price', e.target.value)}
                        placeholder="1500"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(vIndex, 'stock', e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Attributes (e.g. Size: Large, Color: Red)</span>
                      <button
                        type="button"
                        onClick={() => addVariantAttribute(vIndex)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add Attribute
                      </button>
                    </div>
                    {v.attributes.map((attr, attrIndex) => (
                      <div key={attrIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={attr.key}
                          onChange={(e) => updateVariantAttribute(vIndex, attrIndex, 'key', e.target.value)}
                          placeholder="Name (e.g. Size)"
                          className="w-1/2 px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={attr.value}
                          onChange={(e) => updateVariantAttribute(vIndex, attrIndex, 'value', e.target.value)}
                          placeholder="Value (e.g. Large)"
                          className="w-1/2 px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantAttribute(vIndex, attrIndex)}
                          className="text-red-500 hover:text-red-700 text-xs px-2"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/vendor/products"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
