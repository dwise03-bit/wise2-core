/**
 * Payments Routes
 * Handles payment intents, order creation, and payment confirmation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth';
import { paymentService } from '../services/payment.service';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/payments/create-order
 * Create an order (does NOT process payment yet)
 */
router.post('/create-order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { items, metadata } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Items array is required and must not be empty',
        },
      });
    }

    const { order, orderItems } = await paymentService.createOrder(userId, items, metadata);

    res.status(201).json({
      success: true,
      data: {
        order,
        items: orderItems,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/payments/orders
 * List user orders
 */
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const orders = await paymentService.listUserOrders(userId, limit);

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/payments/orders/:orderId
 * Get order details
 */
router.get('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { orderId } = req.params;

    const order = await paymentService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Verify user owns this order
    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this order',
        },
      });
    }

    const items = await paymentService.getOrderItems(orderId);

    res.status(200).json({
      success: true,
      data: { order, items },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/payments/confirm
 * Confirm payment (after Stripe processes it)
 * In production, this would be called after receiving webhook from Stripe
 */
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { orderId, stripePaymentIntentId } = req.body;

    if (!orderId || !stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order ID and Stripe payment intent ID are required',
        },
      });
    }

    // Verify order belongs to user
    const order = await paymentService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this order',
        },
      });
    }

    const confirmedOrder = await paymentService.confirmPayment(orderId, stripePaymentIntentId);

    res.status(200).json({
      success: true,
      data: { order: confirmedOrder },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/payments/cancel/:orderId
 * Cancel an order
 */
router.post('/cancel/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await paymentService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this order',
        },
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: 'Cannot cancel a completed order',
        },
      });
    }

    const cancelledOrder = await paymentService.cancelOrder(orderId, reason);

    res.status(200).json({
      success: true,
      data: { order: cancelledOrder },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/payments/products
 * List available products
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const products = await paymentService.listProducts(category, limit);

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/payments/products/:productId
 * Get product details
 */
router.get('/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const product = await paymentService.getProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
