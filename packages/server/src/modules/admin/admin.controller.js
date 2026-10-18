import { User } from '../auth/user.model.js';
import { Product } from '../products/product.model.js';
import { NotFoundError } from '../../utils/errors.js';

export const adminService = {
  async getVendors() {
    return User.find({ role: 'vendor' }).select('-refreshToken');
  },

  async verifyVendor(vendorId, isVerified) {
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      throw new NotFoundError('Vendor not found');
    }
    vendor.isVerified = isVerified;
    await vendor.save();
    return vendor;
  },

  async getPendingProducts() {
    return Product.find({ status: 'pending' }).populate('vendor', 'email profile');
  },

  async moderateProduct(productId, status) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }
    product.status = status;
    await product.save();
    return product;
  },

  async getPayouts() {
    // Simulated payout list or metadata
    return [
      {
        _id: 'payout_1',
        vendorId: '60d0fe4f5311236168a109ca',
        storeName: 'Himalayan Crafts',
        amount: 45000,
        status: 'completed',
        date: new Date().toISOString(),
      },
      {
        _id: 'payout_2',
        vendorId: '60d0fe4f5311236168a109cb',
        storeName: 'Kathmandu Organic',
        amount: 12500,
        status: 'pending',
        date: new Date().toISOString(),
      },
    ];
  },

  async processPayout(payoutId) {
    return {
      _id: payoutId,
      status: 'completed',
      processedAt: new Date().toISOString(),
    };
  },
};

export const adminController = {
  async getVendors(req, res, next) {
    try {
      const vendors = await adminService.getVendors();
      res.status(200).json({ success: true, data: { vendors } });
    } catch (error) {
      next(error);
    }
  },

  async verifyVendor(req, res, next) {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;
      const vendor = await adminService.verifyVendor(id, isVerified);
      res.status(200).json({ success: true, message: 'Vendor verification updated', data: { vendor } });
    } catch (error) {
      next(error);
    }
  },

  async getPendingProducts(req, res, next) {
    try {
      const products = await adminService.getPendingProducts();
      res.status(200).json({ success: true, data: { products } });
    } catch (error) {
      next(error);
    }
  },

  async moderateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const product = await adminService.moderateProduct(id, status);
      res.status(200).json({ success: true, message: `Product ${status}`, data: { product } });
    } catch (error) {
      next(error);
    }
  },

  async getPayouts(req, res, next) {
    try {
      const payouts = await adminService.getPayouts();
      res.status(200).json({ success: true, data: { payouts } });
    } catch (error) {
      next(error);
    }
  },

  async processPayout(req, res, next) {
    try {
      const { id } = req.params;
      const payout = await adminService.processPayout(id);
      res.status(200).json({ success: true, message: 'Payout processed successfully', data: { payout } });
    } catch (error) {
      next(error);
    }
  },
};
