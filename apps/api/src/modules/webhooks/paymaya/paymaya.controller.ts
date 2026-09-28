import { saleService } from '../../sale/sale.service.js';
import { paymentOptionService } from '../../paymentOption/paymentOption.service.js';
import { accessPassService } from '../../accessPass/accessPass.service.js';
import { config } from '../../../config/index.js';
import { emailService } from '../../email/email.service.js';
import type { Request, Response } from 'express';

export const paymayaRequestCheckout = async (req: Request, res: Response) => {
  const paymayaPK = config.paymaya.publicKey;
  const PaymayaCredentialsBase64 = Buffer.from(paymayaPK + ':').toString(
    'base64',
  );
  const paymayaEnvironment = config.paymaya.environment || 'sandbox';
  const paymayaBaseURL =
    paymayaEnvironment !== 'prod'
      ? 'https://pg-sandbox.paymaya.com/checkout/v1/checkouts'
      : 'https://pg.paymaya.com/checkout/v1/checkouts';

  const { refId, customerFirstName, customerLastName } = req.body;

  const sale = await saleService.getByRefIdWithDetails(refId);

  if (!sale) {
    return res.status(400).json({
      error: 'Sale not found',
      message: 'Please contact support',
    });
  }

  const checkoutItems = sale.cartItems.map((item) => {
    return {
      name: (item.ticketId as unknown as { name: string }).name,
      quantity: item.qty,
      totalAmount: {
        value: (Number(item.priceAcquired) * item.qty).toFixed(2),
        currency: 'PHP',
      },
    };
  });

  //Create Checkout Session with Paymaya
  const checkoutPayload = {
    items: checkoutItems,
    totalAmount: {
      value: Number(sale.orderTotal).toFixed(2),
      currency: 'PHP',
    },
    buyer: {
      firstName: customerFirstName || sale.customerName.split(' ')[0] || '',
      lastName: customerLastName || sale.customerName.split(' ')[1] || '',
      contact: {
        phone: sale.contactNumber || '',
        email: sale.emailAddress || '',
      },
    },
    redirectUrl: {
      success: `${config.app.websiteUrl}/?payment=success&refid=${refId}`,
      failure: `${config.app.websiteUrl}/?payment=failure&refid=${refId}`,
      cancel: `${config.app.websiteUrl}/?payment=cancel&refid=${refId}`,
    },
    requestReferenceNumber: refId,
    metadata: {},
  };

  //Send Checkout Payload to Paymaya API
  try {
    const paymayaResponse = await fetch(paymayaBaseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${PaymayaCredentialsBase64}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!paymayaResponse.ok) {
      console.error('Paymaya Create Checkout Error:', paymayaResponse);
      return res.status(400).json({
        error: 'Paymaya create checkout failed',
      });
    }

    const paymayaData = await paymayaResponse.json();

    console.log('Paymaya Checkout Response: ', paymayaData);

    return res.status(200).json({
      success: true,
      data: paymayaData,
    });
  } catch (error) {
    console.error('Paymaya Create Checkout Exception:', error);
    return res.status(502).json({
      error: 'Paymaya create checkout failed',
      message: 'An error occurred while creating Paymaya checkout',
    });
  }
};

export const paymayaPaymentSuccess = async (req: Request, res: Response) => {
  console.log('TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS');
  console.log('PAYMAYA PAYLOAD: ', req.body);

  const rawIpHeader = req.headers['cf-connecting-ip'];
  const rawIp =
    (Array.isArray(rawIpHeader) ? rawIpHeader[0] : rawIpHeader) || req.ip;

  const ip = rawIp
    ?.split(',')[0]
    .trim()
    .replace(/^::ffff:/, '');

  const PAYMAYA_ALLOWED_IPS = config.paymaya.allowedIps
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (!ip || !PAYMAYA_ALLOWED_IPS.includes(ip)) {
    console.log('PAYMAYA WEBHOOK REQUEST IP NOT ALLOWED: ', ip);
    return res.status(200).json({
      error: 'Forbidden',
      message: 'IP not allowed',
    });
  }

  const { status, requestReferenceNumber, amount } = req.body;
  const option = 'paymaya';
  const sale = await saleService.getByRefId(requestReferenceNumber);
  const pOption = await paymentOptionService.getBySlug(option);

  if (!sale) {
    console.log('PAYMAYA PAYMENT SALE NOT FOUND: ', requestReferenceNumber);
    return res.status(200).json({
      error: 'Sale not found',
      message: 'Please contact support',
    });
  }

  if (!sale || amount != sale.orderTotal) {
    console.log(
      'PAYMAYA PAYMENT AMOUNT MISMATCH: ',
      amount,
      'EXPECTED: ',
      sale.orderTotal,
    );
    return res.status(200).json({
      error: 'Payment amount mismatch',
      message: 'Please contact support',
    });

    //Send email to customer, support indicating that there was a discrepancy between the payment amount and the order total.
    //Send email to support to process refund, indicate that no tickets were released due to the discrepancy.
    //Indiciate the amount received and the expected amount, and that the customer should be refunded the amount paid.
  }

  if (pOption.status == false) {
    console.log('PAYMAYA PAYMENT OPTION DISABLED: ', pOption.status);
    return res.status(200).json({
      error: 'Payment option is disabled',
      message: 'Please contact support',
    });

    //Send email to customer, support indicating that Star City is currently not accepting payments from paymaya.
    //Send email to support to process refund if account is charged, indicate that no tickets were released due to the payment option being disabled. Indicate that the customer should be refunded the amount paid if customer was charged.
  }

  if (!!status && status !== 'PAYMENT_SUCCESS') {
    console.log('PAYMAYA PAYMENT STATUS NOT SUCCESS: ', status);
    return res.status(200).json({
      error: 'Payment status not successful',
      message: 'Please contact support',
    });
  }

  if (sale && sale.status == status) {
    console.log('PAYMAYA PAYMENT STATUS ALREADY PROCESSED: ', status);
    return res.status(200).json({
      error: 'Payment status already processed',
      message: 'Please contact support',
    });
  }

  sale.status = status;
  sale.paymentDetails = {
    option: pOption._id,
    referenceNumber: requestReferenceNumber,
    status: status,
  };

  try {
    const result = await sale.save();
    res
      .status(200)
      .json({ status: status, message: 'Paymaya payment processed' });

    //send Acknowledgement receipt
    if (status == 'PAYMENT_SUCCESS') {
      try {
        await accessPassService.generateAccessPassesBySaleId(result._id);
      } catch (err) {
        console.log('ERROR IN GENERATING ACCESS PASSES: ', err);
      }

      await emailService.sendAcknowledgementReceiptBySaleId(result._id);
    }
  } catch (err) {
    return res.status(400).json({
      error: 'Unable to process Paymaya payment',
      message: err,
    });
  }
};

export const paymayaPaymentFailed = async (req: Request, res: Response) => {
  res.status(200).json({
    function: 'PaymayaPaymentFailed',
    resPayload: req.body,
    params: req.params,
  });
};

export const paymayaPaymentExpired = async (req: Request, res: Response) => {
  res.status(200).json({
    function: 'PaymayaPaymentExpired',
    resPayload: req.body,
    params: req.params,
  });
};
