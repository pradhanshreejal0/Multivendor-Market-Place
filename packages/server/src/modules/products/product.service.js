import { z } from 'zod';
import { Product } from './product.model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';

export const productCreateSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ne: z.string().optional().default(''),
  }),
  description: z.object({
    en: z.string().min(1, 'English description is required'),
    ne: z.string().optional().default(''),
  }),
  category: z.object({
    en: z.string().min(1, 'English category is required'),
    ne: z.string().optional().default(''),
  }),
  price: z.number().min(0, 'Price must be a positive number'),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(
    z.object({
      sku: z.string().min(1, 'SKU is required'),
      attributes: z.record(z.string()).optional(),
      price: z.number().min(0, 'Variant price must be positive'),
      stock: z.number().min(0, 'Variant stock must be non-negative'),
    })
  ).optional().default([]),
  stock: z.number().min(0, 'Stock must be non-negative').default(0),
  tags: z.array(z.string()).optional().default([]),
  attributes: z.record(z.string()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productModerationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

export class ProductService {
  static async createProduct(vendorId, data) {
    const validatedData = productCreateSchema.parse(data);

    // Generate unique slug from English name
    let baseSlug = validatedData.name.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      ...validatedData,
      slug,
      vendor: vendorId,
      status: 'pending', // Vendor products start as pending moderation or draft depending on workflow, let's make them pending or default draft. Wait, let's check requirements: vendor product CRUD, admin moderation. Pending makes sense.
    });

    return product;
  }

  static async getProducts(queryObj) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      status = 'approved',
      sort = '-createdAt',
    } = queryObj;

    const query = {};

    // Public users only see approved products unless admin/vendor queries their own
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query['category.en'] = new RegExp(category, 'i');
    }

    if (vendor) {
      query.vendor = vendor;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    let dbQuery = Product.find(query).populate('vendor', 'name email storeName');

    if (search) {
      dbQuery = dbQuery.sort({ score: { $meta: 'textScore' }, [sort.replace(/^-/, '')]: sort.startsWith('-') ? -1 : 1 });
    } else {
      dbQuery = dbQuery.sort(sort);
    }

    const [products, total] = await Promise.all([
      dbQuery.skip(skip).limit(parsedLimit).exec(),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  static async getProductById(id) {
    const product = await Product.findById(id).populate('vendor', 'name email storeName');
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  static async updateProduct(id, userId, userRole, data) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (userRole !== 'admin' && product.vendor.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to update this product');
    }

    const validatedData = productUpdateSchema.parse(data);

    if (validatedData.name && validatedData.name.en && validatedData.name.en !== product.name.en) {
      let baseSlug = validatedData.name.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      validatedData.slug = slug;
    }

    // If vendor updates product, reset status to pending for re-moderation (optional but good practice)
    if (userRole === 'vendor') {
      validatedData.status = 'pending';
    }

    Object.assign(product, validatedData);
    await product.save();

    return product;
  }

  static async deleteProduct(id, userId, userRole) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (userRole !== 'admin' && product.vendor.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to delete this product');
    }

    await Product.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }

  static async moderateProduct(id, data) {
    const validatedData = productModerationSchema.parse(data);
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.status = validatedData.status;
    if (validatedData.status === 'rejected') {
      product.rejectionReason = validatedData.rejectionReason || 'No reason provided';
    } else {
      product.rejectionReason = '';
    }

    await product.save();
    return product;
  }
}
