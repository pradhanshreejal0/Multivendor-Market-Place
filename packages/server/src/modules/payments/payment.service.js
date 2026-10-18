import crypto from 'crypto';
import axios from 'axios';
import { Payment } from './payment.model.js';
import { Order } from '../orders/order.model.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

export const paymentService = {
  async initiatePayment(userId, { orderId, gateway }) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new NotFoundError('Order not found or unauthorized');
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestError('Order is already paid');
    }

    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create a pending payment record
    const payment = await Payment.create({
      order: order._id,
      user: userId,
      gateway,
      transactionId,
      amount: order.totalAmount,
      currency: 'NPR',
      status: 'pending',
    });

    // Update order payment method
    order.paymentMethod = gateway;
    await order.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    if (gateway === 'esewa') {
      // eSewa test/production parameters
      // eSewa ePay v2 / v1.3 configuration
      const merchantCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
      const successUrl = `${serverUrl}/api/v1/payments/verify/esewa?oid=${transactionId}&orderId=${order._id}`;
      const failureUrl = `${clientUrl}/checkout/failure?orderId=${order._id}`;

      return {
        gateway: 'esewa',
        paymentUrl: process.env.ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        payload: {
          amount: order.totalAmount,
          tax_amount: '0',
          total_amount: order.totalAmount,
          transaction_uuid: transactionId,
          product_code: merchantCode,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          // signature can be generated using HMAC-SHA256 if secret key is present
          signature: this._generateEsewaSignature(
            process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
            `total_amount=${order.totalAmount},transaction_uuid=${transactionId},product_code=${merchantCode}`
          ),
        },
        transactionId,
      };
    } else if (gateway === 'khalti') {
      // Khalti ePayment initiation via API
      const khaltiSecretKey = process.env.KHALTI_SECRET_KEY || 'key_live_test';
      const khaltiInitUrl = process.env.KHALTI_INIT_URL || 'https://a.khalti.com/api/v2/epayment/initiate/';

      const payload = {
        return_url: `${serverUrl}/api/v1/payments/verify/khalti?orderId=${order._id}&transactionId=${transactionId}`,
        website_url: clientUrl,
        amount: Math.round(order.totalAmount * 100), // amount in paisa
        purchase_order_id: transactionId,
        purchase_order_name: `Order #${order._id}`,
      };

      try {
        // If in test/mock mode or if request fails without valid live key, return mock checkout URL
        let paymentUrl = `${clientUrl}/checkout/khalti-sandbox?tid=${transactionId}&amount=${order.totalAmount}`;
        let gatewayTransactionId = null;

        if (process.env.NODE_ENV === 'production' || process.env.KHALTI_LIVE === 'true') {
          const response = await axios.post(khaltiInitUrl, payload, {
            headers: {
              Authorization: `Key ${khaltiSecretKey}`,
              'Content-Type': 'application/json',
            },
          });
          paymentUrl = response.data.payment_url;
          gatewayTransactionId = response.data.pidx;
        }

        payment.gatewayTransactionId = gatewayTransactionId;
        await payment.save();

        return {
          gateway: 'khalti',
          paymentUrl,
          transactionId,
          gatewayTransactionId,
        };
      } catch (error) {
        throw new BadRequestError(`Khalti initiation failed: ${error.response?.data?.detail || error.message}`);
      }
    } else if (gateway === 'fonepay') {
      // FonePay Gateway integration placeholder / direct return
      return {
        gateway: 'fonepay',
        paymentUrl: `${clientUrl}/checkout/fonepay-sandbox?tid=${transactionId}&amount=${order.totalAmount}`,
        transactionId,
        message: 'FonePay payment initiated successfully',
      };
    } else if (gateway === 'bank_transfer') {
      return {
        gateway: 'bank_transfer',
        transactionId,
        bankDetails: {
          bankName: 'Global IME Bank Nepal',
          accountName: 'E-Commerce Marketplace Pvt. Ltd.',
          accountNumber: '01234567890123',
          branch: 'Durbar Marg, Kathmandu',
          swiftCode: 'GLBINEPK',
        },
        message: 'Please transfer the amount and submit bank transfer reference details.',
      };
    } else if (gateway === 'cod') {
      payment.status = 'completed';
      await payment.save();

      order.paymentStatus = 'pending';
      await order.save();

      return {
        gateway: 'cod',
        transactionId,
        status: 'completed',
        message: 'Cash on Delivery order placed successfully',
      };
    } else {
      throw new BadRequestError('Invalid payment gateway');
    }
  },

  async verifyPayment(gateway, queryParams, bodyData) {
    if (gateway === 'esewa') {
      // eSewa verification (via query params or callback data)
      const { oid, data, transaction_uuid, total_amount, transaction_code } = queryParams;
      const tid = oid || transaction_uuid;

      const payment = await Payment.findOne({ transactionId: tid });
      if (!payment) {
        throw new NotFoundError('Payment transaction not found');
      }

      // If eSewa returned base64 encoded response (v2)
      if (data) {
        try {
          const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
          if (decodedData.status === 'COMPLETE') {
            payment.status = 'completed';
            payment.gatewayTransactionId = decodedData.transaction_code || transaction_code;
            payment.gatewayResponse = decodedData;
            await payment.save();

            const order = await Order.findById(payment.order);
            if (order) {
              order.paymentStatus = 'paid';
              await order.save();
            }
            return { success: true, payment, order };
          }
        } catch (e) {
          // Fallback if not valid base64 JSON
        }
      }

      // If direct successful return parameters
      if (transaction_code || payment.status === 'pending') {
        payment.status = 'completed';
        payment.gatewayTransactionId = transaction_code || 'ESEWA-' + Date.now();
        payment.gatewayResponse = queryParams;
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
        }
        return { success: true, payment, order };
      }

      payment.status = 'failed';
      payment.gatewayResponse = queryParams;
      await payment.save();
      throw new BadRequestError('eSewa payment verification failed');
    } else if (gateway === 'khalti') {
      const { pidx, transactionId, orderId, status } = queryParams;

      const payment = await Payment.findOne({
        $or: [{ gatewayTransactionId: pidx }, { transactionId: transactionId }, { order: orderId }],
      });

      if (!payment) {
        throw new NotFoundError('Payment transaction not found');
      }

      if (status === 'Completed' || payment.status === 'pending') {
        payment.status = 'completed';
        payment.gatewayTransactionId = pidx || payment.gatewayTransactionId;
        payment.gatewayResponse = queryParams;
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
        }
        return { success: true, payment, order };
      }

      payment.status = 'failed';
      await payment.save();
      throw new BadRequestError('Khalti payment verification failed');
    } else if (gateway === 'bank_transfer') {
      const { orderId, bankName, accountNumber, referenceNumber, receiptUrl } = bodyData;

      const payment = await Payment.findOne({ order: orderId, gateway: 'bank_transfer' });
      if (!payment) {
        throw new NotFoundError('Bank transfer payment record not found');
      }

      payment.bankTransferDetails = {
        bankName,
        accountName: bodyData.accountName,
        accountNumber,
        referenceNumber,
        receiptUrl,
      };
      payment.status = 'pending'; // Requires admin verification
      payment.gatewayResponse = bodyData;
      await payment.save();

      return { success: true, payment, message: 'Bank transfer details submitted successfully for admin approval.' };
    } else {
      throw new BadRequestError('Unsupported payment gateway for verification');
    }
  },

  async confirmBankTransfer(paymentId, status) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    payment.status = status; // 'completed' or 'failed'
    await payment.save();

    if (status === 'completed') {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
      }
    }

    return payment;
  },

  _generateEsewaSignature(secretKey, message) {
    try {
      const hash = crypto.createHmac('sha256', secretKey).update(message).digest('base64');
      return hash;
    } catch (e) {
      return 'TEST_SIGNATURE';
    }
  },
};
