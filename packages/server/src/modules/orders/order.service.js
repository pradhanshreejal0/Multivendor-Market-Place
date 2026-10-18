import { Order } from './order.model.js';
import { Cart } from '../cart/cart.model.js';
import { Product } from '../products/product.model.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

export const orderService = {
  async checkout(userId, { shippingAddress, paymentMethod }) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug price images stock status vendor variants',
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Validate all items and stock, and group by vendor
    const vendorMap = new Map(); // vendorId -> { vendor, items: [], subtotal: 0 }

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'approved') {
        throw new BadRequestError(`Product ${product?.name?.en || 'Unknown'} is no longer available`);
      }

      let unitPrice = item.priceAtAdd;
      let availableStock = product.stock;

      if (item.variantSku) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (!variant) {
          throw new NotFoundError(`Variant ${item.variantSku} not found for product ${product.name.en}`);
        }
        unitPrice = variant.price;
        availableStock = variant.stock;
      }

      if (item.quantity > availableStock) {
        throw new BadRequestError(`Insufficient stock for ${product.name.en} (Requested: ${item.quantity}, Available: ${availableStock})`);
      }

      const vendorId = product.vendor.toString();
      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          vendor: product.vendor,
          items: [],
          itemsSubtotal: 0,
        });
      }

      const vendorGroup = vendorMap.get(vendorId);
      vendorGroup.items.push({
        product: product._id,
        variantSku: item.variantSku || null,
        quantity: item.quantity,
        price: unitPrice,
      });
      vendorGroup.itemsSubtotal += unitPrice * item.quantity;
    }

    // Construct sub-orders and deduct stock safely using findOneAndUpdate with atomic stock condition checks
    const subOrders = [];
    let grandTotal = 0;

    for (const [vendorId, group] of vendorMap.entries()) {
      const shippingFee = 150;
      const totalAmount = group.itemsSubtotal + shippingFee;
      grandTotal += totalAmount;

      subOrders.push({
        vendor: group.vendor,
        items: group.items,
        itemsSubtotal: group.itemsSubtotal,
        shippingFee,
        totalAmount,
        status: 'pending',
      });

      // Deduct stock atomically
      for (const item of group.items) {
        let updateResult;
        if (item.variantSku) {
          updateResult = await Product.findOneAndUpdate(
            { _id: item.product, 'variants.sku': item.variantSku, 'variants.stock': { $gte: item.quantity } },
            { $inc: { 'variants.$.stock': -item.quantity } },
            { new: true }
          );
        } else {
          updateResult = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
        }

        if (!updateResult) {
          throw new BadRequestError(`Insufficient stock or product unavailable during checkout for item ${item.product}`);
        }
      }
    }

    // Create Order
    const order = await Order.create({
      user: userId,
      subOrders,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      totalAmount: grandTotal,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    return order;
  },

  async getUserOrders(userId) {
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'subOrders.items.product',
        select: 'name slug images',
      })
      .populate({
        path: 'subOrders.vendor',
        select: 'name email',
      })
      .sort({ createdAt: -1 });

    return orders;
  },

  async getOrderById(userId, userRole, orderId) {
    const order = await Order.findById(orderId)
      .populate({
        path: 'subOrders.items.product',
        select: 'name slug images',
      })
      .populate({
        path: 'subOrders.vendor',
        select: 'name email storeName',
      })
      .populate('user', 'name email phone');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
      const isVendorInOrder = order.subOrders.some((so) => so.vendor._id.toString() === userId.toString());
      if (!isVendorInOrder) {
        throw new ForbiddenError('Unauthorized to view this order');
      }
    }

    return order;
  },

  async getVendorOrders(vendorId) {
    const orders = await Order.find({ 'subOrders.vendor': vendorId })
      .populate({
        path: 'subOrders.items.product',
        select: 'name slug images',
      })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter subOrders for this vendor
    const vendorOrders = orders.map((order) => {
      const subOrders = order.subOrders.filter(
        (so) => so.vendor.toString() === vendorId.toString()
      );
      return {
        _id: order._id,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        subOrders,
      };
    });

    return vendorOrders;
  },

  async updateSubOrderStatus(vendorId, orderId, subOrderId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      throw new NotFoundError('Sub-order not found');
    }

    if (subOrder.vendor.toString() !== vendorId.toString()) {
      throw new ForbiddenError('Unauthorized to update this sub-order');
    }

    subOrder.status = status;
    await order.save();
    return order;
  },
};
