import Sale from '../sale/sale.model.js';
import SmQueue from '../smTickets/smQueue.model.js';
import SmTicket from '../smTickets/smTickets.model.js';
import { paymentOptionService } from '../paymentOption/paymentOption.service.js';
import {
  generateAccessPass,
  sendAR,
  getOpenParkExpiry,
} from '../sale/sale.controller.js';
import { format } from 'date-fns';
import { cronSyncSMTickets } from '../../common/cron/cronjobs.js';
import { config } from '../../config/index.js';
import { turnstileSyncService } from '../turnstileSync/turnstileSync.service.js';

export const paymayaRequestCheckout = async (req, res) => {
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

  const sale = await Sale.findOne({ refId: refId })
    .populate({
      path: 'cartItems',
      populate: {
        path: 'ticketId',
        model: 'Ticket',
        select: 'name -_id',
      },
    })
    .exec();

  if (!sale) {
    return res.status(400).json({
      error: 'Sale not found',
      message: 'Please contact support',
    });
  }

  const checkoutItems = sale.cartItems.map((item) => {
    return {
      name: item.ticketId.name,
      quantity: item.qty,
      totalAmount: {
        value: (item.priceAcquired * item.qty).toFixed(2),
        currency: 'PHP',
      },
    };
  });

  //Create Checkout Session with Paymaya
  const checkoutPayload = {
    items: checkoutItems,
    totalAmount: {
      value: sale.orderTotal.toFixed(2),
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

export const paymayaPaymentSuccess = async (req, res) => {
  console.log('TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS');
  console.log('PAYMAYA PAYLOAD: ', req.body);

  // req.ip is resolved via Express's trust proxy setting, so it safely
  // handles multi-value X-Forwarded-For instead of treating it as one IP.
  // Take only the first value in case a header was duplicated, and strip
  // the ::ffff: prefix Node adds to IPv4 addresses on dual-stack sockets.
  const rawIp = req.headers['cf-connecting-ip'] || req.ip;
  const ip = rawIp
    ?.split(',')[0]
    .trim()
    .replace(/^::ffff:/, '');
  // Comma-separated list of IPs allowed to call the Paymaya webhook, e.g. "18.138.50.235,3.1.207.200"
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
  const sale = await Sale.findOne({ refId: requestReferenceNumber }).exec();
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
    option: await pOption._id,
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
      generateAccessPass(result, result.cartItems);
      sendAR(result.refId);
    }
  } catch (err) {
    return res.status(400).json({
      error: 'Unable to process Paymaya payment',
      message: err,
    });
  }
};

export const paymayaPaymentFailed = async (req, res) => {
  res.status(200).json({
    function: 'PaymayaPaymentFailed',
    resPayload: req.body,
    params: req.params,
  });
};

export const paymayaPaymentExpired = async (req, res) => {
  res.status(200).json({
    function: 'PaymayaPaymentExpired',
    resPayload: req.body,
    params: req.params,
  });
};

const addToQueue = async (
  tokenID,
  rideCode,
  ticketExpiry,
  status = 'for delivery',
) => {
  let newQ = new SmQueue();
  newQ.tokenID = tokenID;
  newQ.RideCode = rideCode;
  newQ.status = status;
  newQ.ticketExpiry = ticketExpiry;

  try {
    await newQ.save();
    console.log('QUEUE CREATED FOR SM TICKET: ', tokenID);
  } catch (err) {
    console.log('ERROR IN QUEUEING SM TICKET: ', err);
  }
};

const processTickets = (tickets) => {
  tickets.map(async (item) => {
    const { ticketID, ticketType, ticketExpiry } = item;
    console.log('PROCESSING TICKET: ', item);

    //record new tiken
    const newticket = new SmTicket();
    newticket.tokenId = ticketID;
    newticket.method = 'Purchase';
    newticket.ticketType = ticketType;
    if (ticketExpiry) {
      newticket.ticketExpiry = ticketExpiry;
    } else {
      newticket.ticketExpiry = `${format(
        new Date(getOpenParkExpiry()),
        'yyyy-LL-dd',
      )} 23:59:59`;
    }

    try {
      await newticket.save();
      console.log('SM Ticket recorded: ', ticketID);
    } catch (err) {
      console.log(err);
    }

    try {
      const date = new Date();
      const expiryDate = ticketExpiry
        ? ticketExpiry
        : `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`;
      await turnstileSyncService.addAccessPassToTurnstile({
        accesspassCode: ticketID,
        origin: 'smticket',
        date: date,
        expiry: expiryDate,
      });
    } catch {
      addToQueue(
        ticketID,
        ticketType,
        ticketExpiry
          ? ticketExpiry
          : `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`,
        'Error in mySQL',
      );
    }
  });
};

export const smTicketTest = async (req, res) => {
  cronSyncSMTickets();

  res.status(200).json({
    message: 'Connection Test Success',
  });
};

export const smTicketExpiry = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    // expiry: getOpenParkExpiry(),
    expiry: `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`,
  });
};

export const smTicketTransact = async (req, res) => {
  console.log('PROCESSING SM TICKETS TRANSACTION...');
  const { tickets, token } = req.body;

  if (token !== config.sm.token) {
    res.status(401).json({
      status: 'Invalid Auth Token',
      message: 'Please make sure that your token in your request body is valid',
    });
    return;
  }

  if (!tickets || tickets.length < 1) {
    return res.status(400).json({
      status: 'Invalid Transaction',
      message: 'No Ticket IDs found',
    });
  }

  const idArray = tickets.map((item) => item.ticketID);
  const isComplete =
    await turnstileSyncService.isTransactionCompleteInTurnstile(idArray);

  if (isComplete) {
    return res.status(400).json({
      status: 'TicketID already exists in Turnstile',
      message: 'Please provide unique IDs',
    });
  }

  processTickets(tickets);
  res.status(200).json({
    status: 'Success',
    message: 'Tickets synchronized successfully',
  });
};

export const smTicketVoid = async (req, res) => {
  console.log('VOIDING SM TICKET TRANSACTION...');
  const { token, tickets } = req.body;

  if (token !== config.sm.token) {
    return res.status(401).json({
      status: 'Invalid Auth Token',
      message: 'Please make sure that your token in your request body is valid',
    });
  }

  if (tickets.length < 1) {
    return res.status(400).json({
      status: 'Invalid Transaction',
      message: 'No Ticket IDs found',
    });
  }

  await Promise.all(
    tickets.map(async (item) => {
      const { ticketID } = item;
      console.log('VOIDING TICKET: ', ticketID);

      //record new tiken
      const newticket = new SmTicket();
      newticket.tokenId = ticketID;
      newticket.method = 'Void';

      try {
        await newticket.save();
        console.log('SM Ticket voided: ', ticketID);
      } catch (err) {
        console.log(err);
      }

      try {
        await turnstileSyncService.voidAccessPassInTurnstile(ticketID);
      } catch {
        console.log('ERROR IN VOIDING TICKET...');
        return res.status(500).json({
          status: 'Internal Server Error',
          message: 'Cannot connect to Turnstile System',
        });
      }
    }),
  );

  res.status(200).json({
    status: 'Success',
    message: 'Tickets voided successfully',
  });
};

export const bpiTransact = async (req, res) => {
  console.log(`PROCESSING BPI TRANSACTION...`);
  const {
    transactionReference,
    confirmationNumber,
    merchantTransactionReference,
    transactionStatus,
  } = req.query;

  // /webhooks/v1/bpi?transactionReference=DDD69E7E36D9&confirmationNumber=undefined&transactionStatus=INCOMPLETE&statusCode=0&merchantTransactionReference=DDD69E7E36D9
  if (
    merchantTransactionReference &&
    transactionStatus &&
    transactionStatus == 'SUCCESSFUL'
  ) {
    const sale = await Sale.findOne({
      refId: merchantTransactionReference,
    }).exec();
    if (sale) {
      if (sale.status == 'awaiting payment') {
        //PROCESS SALE (GENERATE AND SEND AR)
        const option = 'bpi';
        const pOption = await paymentOptionService.getBySlug(option);

        if (!pOption || pOption.status == false) {
          console.log('BPI PAYMENT OPTION DISABLED: ', pOption.status);
          return res.redirect(
            `${config.app.websiteUrl}/?payment=error&refid=${merchantTransactionReference}`,
          );
        }

        sale.status = transactionStatus;
        sale.paymentDetails = {
          option: await pOption._id,
          referenceNumber: confirmationNumber,
          status: transactionStatus,
        };

        //UPDATE DATA
        try {
          const result = await sale.save();
          if (transactionStatus == 'SUCCESSFUL') {
            console.log('GENERATING ACCESS PASS');
            generateAccessPass(result, result.cartItems);
            console.log('SENDING ACKNOWLEDGEMENT RECEIPT');
            sendAR(result.refId);
            return res.redirect(
              `${config.app.websiteUrl}/?payment=success&refid=${result.refId}`,
            );
          }
        } catch (err) {
          console.log('Unable to process BPI payment', err);
        }
        //SEND STATUS 200
      } else {
        console.log(
          `BPI: Reference ID ${transactionReference} ALREADY PROCESSED...`,
        );
        return res.redirect(
          `${config.app.websiteUrl}/?payment=success&refid=${transactionReference}`,
        );
      }
    } else {
      console.log(`BPI: Reference ID ${transactionReference} NOT FOUND...`);
    }
  } else {
    console.log(`BPI: Reference ID ${transactionReference} NOT CONFIRMED`);
    return res.redirect(
      `${config.app.websiteUrl}/?payment=success&refid=${transactionReference}`,
    );
  }
};
