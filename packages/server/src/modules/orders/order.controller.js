import { orderService } from './order.service.js';

export const orderController = {
  async checkout(req, res, next) {
    try {
      const order = await orderService.checkout(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Checkout successful',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.user._id);
      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorOrders(req, res, next) {
    try {
      const orders = await orderService.getVendorOrders(req.user._id);
      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSubOrderStatus(req, res, next) {
    try {
      const { orderId, subOrderId } = req.params;
      const { status } = req.body;
      const order = await orderService.updateSubOrderStatus(
        req.user._id,
        orderId,
        subOrderId,
        status
      );
      res.status(200).json({
        success: true,
        message: 'Sub-order status updated successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  },
};
