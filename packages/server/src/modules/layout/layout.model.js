import mongoose from 'mongoose';

const layoutBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // 'hero', 'product-grid', 'banner', 'category-carousel'
  props: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const pageLayoutSchema = new mongoose.Schema(
  {
    pageName: { type: String, required: true, unique: true, default: 'homepage' },
    blocks: [layoutBlockSchema],
    publishedBlocks: [layoutBlockSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  {
    timestamps: true,
  }
);

export const PageLayout = mongoose.model('PageLayout', pageLayoutSchema);
