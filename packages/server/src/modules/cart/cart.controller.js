import { z } from 'zod';
import { cartService } from './cart.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantSku: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantSku: z.string().optional().nullable(),
      quantity: z.number().int().min(1),
    })
  ),
});

export const cartController = {
  getCart: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const cart = await cartService.getCart(userId);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),

  addItem: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const validatedData = addToCartSchema.parse(req.body);
    const cart = await cartService.addItem(userId, validatedData);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),

  updateItem: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = updateCartItemSchema.parse(req.body);
    const cart = await cartService.updateItemQuantity(userId, itemId, quantity);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),

  removeItem: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { itemId } = req.params;
    const cart = await cartService.removeItem(userId, itemId);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),

  clearCart: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const cart = await cartService.clearCart(userId);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),

  syncCart: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { items } = syncCartSchema.parse(req.body);
    const cart = await cartService.syncCart(userId, items);
    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }),
};
