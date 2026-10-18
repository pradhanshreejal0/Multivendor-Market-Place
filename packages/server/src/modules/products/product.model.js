import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, index: true },
      ne: { type: String, trim: true, default: '' },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      en: { type: String, required: true },
      ne: { type: String, default: '' },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      en: { type: String, required: true, index: true },
      ne: { type: String, default: '' },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: [{ type: String }],
    variants: [
      {
        sku: { type: String, required: true },
        attributes: { type: Map, of: String }, // e.g., Size: L, Color: Red
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    tags: [{ type: String, index: true }],
    attributes: { type: Map, of: String },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for full-text search and filtering
productSchema.index({ 'name.en': 'text', 'name.ne': 'text', 'description.en': 'text', 'description.ne': 'text', 'tags': 'text' });
productSchema.index({ status: 1, price: 1, category: 'en' });
productSchema.index({ vendor: 1, status: 1 });

export const Product = mongoose.model('Product', productSchema);
