import { ProductService, productModerationSchema } from './product.service.js';

export class ProductController {
  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.user._id, req.body);
      res.status(201).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      // If vendor is requesting their own products or admin requesting all with status
      const result = await ProductService.getProducts(req.query);
      res.status(200).json({
        status: 'success',
        results: result.products.length,
        pagination: result.pagination,
        data: { products: result.products },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVendorProducts(req, res, next) {
    try {
      const query = { ...req.query, vendor: req.user._id };
      if (req.user.role === 'admin' && req.query.vendor) {
        query.vendor = req.query.vendor;
      }
      const result = await ProductService.getProducts(query);
      res.status(200).json({
        status: 'success',
        results: result.products.length,
        pagination: result.pagination,
        data: { products: result.products },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body
      );
      res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(
        req.params.id,
        req.user._id,
        req.user.role
      );
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async moderateProduct(req, res, next) {
    try {
      const product = await ProductService.moderateProduct(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
}
