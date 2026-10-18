import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function LayoutEditor() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      setLoading(true);
      const res = await api.get('/layout/homepage');
      setBlocks(res.data.data.layout.blocks || []);
    } catch (err) {
      console.error('Failed to load layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (type) => {
    const newBlock = {
      id: 'block_' + Date.now(),
      type,
      props: type === 'hero' ? { title: 'New Hero Banner', subtitle: 'Subtitle text here' } :
             type === 'product-grid' ? { title: 'Featured Products', limit: 8 } :
             { title: 'Promo Banner', bannerText: 'Special Offer' }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock);
  };

  const handleUpdateProps = (id, newProps) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, props: newProps } : b));
    if (selectedBlock && selectedBlock.id === id) {
      setSelectedBlock({ ...selectedBlock, props: newProps });
    }
  };

  const handleDeleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlock?.id === id) setSelectedBlock(null);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await api.post('/layout/homepage/draft', { blocks });
      alert('Layout draft saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      await api.post('/layout/homepage/draft', { blocks });
      await api.post('/layout/homepage/publish');
      alert('Layout published successfully to storefront!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Layout Editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Layout Editor</h1>
          <p className="text-sm text-gray-500">Customize blocks, rearrange, and publish instantly.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Publish Live
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Palette & Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex space-x-3">
            <span className="text-sm font-semibold text-gray-700 self-center">Add Block:</span>
            <button
              onClick={() => handleAddBlock('hero')}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100"
            >
              + Hero Banner
            </button>
            <button
              onClick={() => handleAddBlock('product-grid')}
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100"
            >
              + Product Grid
            </button>
            <button
              onClick={() => handleAddBlock('banner')}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100"
            >
              + Promo Banner
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 min-h-[400px]">
            {blocks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                Canvas is empty. Add blocks from above.
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedBlock?.id === block.id ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      #{index + 1} — {block.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {block.props.title || 'Untitled Block'}
                  </div>
                  {block.props.subtitle && (
                    <div className="text-xs text-gray-600 mt-1">{block.props.subtitle}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Properties Inspector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Properties Inspector</h3>
          {selectedBlock ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Block Type</label>
                <input
                  type="text"
                  disabled
                  value={selectedBlock.type}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={selectedBlock.props.title || ''}
                  onChange={(e) => handleUpdateProps(selectedBlock.id, { ...selectedBlock.props, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {selectedBlock.type === 'hero' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtitle</label>
                  <textarea
                    value={selectedBlock.props.subtitle || ''}
                    onChange={(e) => handleUpdateProps(selectedBlock.id, { ...selectedBlock.props, subtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>
              )}

              {selectedBlock.type === 'product-grid' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Product Limit</label>
                  <input
                    type="number"
                    value={selectedBlock.props.limit || 8}
                    onChange={(e) => handleUpdateProps(selectedBlock.id, { ...selectedBlock.props, limit: parseInt(e.target.value) || 8 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Select a block on the canvas to edit its properties.</p>
          )}
        </div>
      </div>
    </div>
  );
}
