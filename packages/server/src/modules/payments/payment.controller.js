import { paymentService } from './payment.service.js';

export const paymentController = {
  async initiate(req, res, next) {
    try {
      const { orderId, gateway } = req.body;
      const result = await paymentService.initiatePayment(req.user._id, { orderId, gateway });
      res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verify(req, res, next) {
    try {
      const { gateway } = req.params;
      const result = await paymentService.verifyPayment(gateway, req.query, req.body);

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      if (req.method === 'GET') {
        // Redirect browser to client success page
        const orderId = result.order?._id || req.query.orderId;
        return res.redirect(`${clientUrl}/checkout/success?orderId=${orderId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: result,
      });
    } catch (error) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      if (req.method === 'GET') {
        const orderId = req.query.orderId || '';
        return res.redirect(`${clientUrl}/checkout/failure?orderId=${orderId}&error=${encodeURIComponent(error.message)}`);
      }
      next(error);
    }
  },

  async submitBankTransfer(req, res, next) {
    try {
      const result = await paymentService.verifyPayment('bank_transfer', {}, req.body);
      res.status(200).json({
        success: true,
        message: 'Bank transfer details submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmBankTransfer(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;
      const payment = await paymentService.confirmBankTransfer(paymentId, status);
      res.status(200).json({
        success: true,
        message: `Payment status updated to ${status}`,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  },
};
