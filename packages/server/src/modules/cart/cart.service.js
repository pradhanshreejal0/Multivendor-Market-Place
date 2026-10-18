import { Cart } from './cart.model.js';
import { Product } from '../products/product.model.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

export const cartService = {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug price images stock status vendor',
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  },

  async addItem(userId, { productId, variantSku, quantity }) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.status !== 'approved') {
      throw new BadRequestError('Product is not available for purchase');
    }

    let unitPrice = product.price;
    let availableStock = product.stock;

    if (variantSku) {
      const variant = product.variants.find((v) => v.sku === variantSku);
      if (!variant) {
        throw new NotFoundError('Product variant not found');
      }
      unitPrice = variant.price;
      availableStock = variant.stock;
    }

    if (quantity > availableStock) {
      throw new BadRequestError(`Requested quantity exceeds available stock (${availableStock})`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.variantSku === variantSku || (!item.variantSku && !variantSku))
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > availableStock) {
        throw new BadRequestError(`Total quantity in cart exceeds available stock (${availableStock})`);
      }
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].priceAtAdd = unitPrice;
    } else {
      cart.items.push({
        product: productId,
        variantSku: variantSku || null,
        quantity,
        priceAtAdd: unitPrice,
      });
    }

    await cart.save();
    return this.getCart(userId);
  },

  async updateItemQuantity(userId, itemId, quantity) {
    if (quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    const product = await Product.findById(item.product);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let availableStock = product.stock;
    if (item.variantSku) {
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (variant) {
        availableStock = variant.stock;
      }
    }

    if (quantity > availableStock) {
      throw new BadRequestError(`Requested quantity exceeds available stock (${availableStock})`);
    }

    item.quantity = quantity;
    await cart.save();
    return this.getCart(userId);
  },

  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    cart.items.pull(itemId);
    await cart.save();
    return this.getCart(userId);
  },

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return { user: userId, items: [] };
    }

    cart.items = [];
    await cart.save();
    return cart;
  },

  async syncCart(userId, localItems) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const localItem of localItems) {
      const { productId, variantSku, quantity } = localItem;
      const product = await Product.findById(productId);
      if (!product || product.status !== 'approved') continue;

      let unitPrice = product.price;
      let availableStock = product.stock;

      if (variantSku) {
        const variant = product.variants.find((v) => v.sku === variantSku);
        if (variant) {
          unitPrice = variant.price;
          availableStock = variant.stock;
        } else {
          continue;
        }
      }

      const effectiveQty = Math.min(quantity, availableStock);
      if (effectiveQty <= 0) continue;

      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          (item.variantSku === variantSku || (!item.variantSku && !variantSku))
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Math.min(
          cart.items[itemIndex].quantity + effectiveQty,
          availableStock
        );
        cart.items[itemIndex].priceAtAdd = unitPrice;
      } else {
        cart.items.push({
          product: productId,
          variantSku: variantSku || null,
          quantity: effectiveQty,
          priceAtAdd: unitPrice,
        });
      }
    }

    await cart.save();
    return this.getCart(userId);
  },
};
