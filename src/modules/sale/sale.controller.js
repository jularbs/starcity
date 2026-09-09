import Sale from './sale.model.js';
import { ticketService } from '../ticket/ticket.service.js';
import { accessPassService } from '../accessPass/accessPass.service.js';
import crypto from 'crypto';
import { emailService } from '../email/email.service.js';
import { format } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { promoService } from '../promo/promo.service.js';
import { getOpenParkExpiry } from '../../common/utils/get-expiry.js';
const { zonedTimeToUtc } = dateFnsTz;

export const resendAR = async (req, res) => {
  const { refId } = req.body;
  //TODOS: refactor to use saleService
  const sale = await Sale.findOne({ refId }).exec();
  try {
    await emailService.sendAcknowledgementReceiptBySaleId(sale._id);
    res.json({ message: 'E-mail resent successfully.' });
  } catch (error) {
    console.log('Error: ', error);
    res.status(400).json({ message: 'E-mail failed. Please try again later.' });
  }
};

//REQUESTS
export const readBySaltRefID = async (req, res) => {
  const saleDetails = await Sale.findOne({
    salt: req.query.salt,
    refId: req.query.refid,
  })
    .select('_id customerName emailAddress contactNumber expiryDate createdAt')
    .exec();

  if (saleDetails == null)
    return res.status(400).json({ error: 'Invalid Data' });

  const accessPasses = await accessPassService.getBySalesId(saleDetails._id);

  res.json({ details: saleDetails, accessPasses });
};

export const read = async (req, res) => {
  try {
    const data = await Sale.findOne({ refId: req.params.refid })
      .select(
        'customerName emailAddress contactNumber orderTotal refId salt paymentDetails',
      )
      .populate({
        path: 'paymentDetails',
        populate: {
          path: 'option',
          model: 'PaymentOption',
          select: 'name',
        },
      })
      .exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

export const list = async (req, res) => {
  const { skip = 0, limit = 10, start, end, search = '' } = req.query;

  const startDate = zonedTimeToUtc(
    `${start}T00:00:00.000`,
    'Asia/Manila',
  ).toISOString();
  const endDate = zonedTimeToUtc(
    `${end}T23:59:59.999`,
    'Asia/Manila',
  ).toISOString();

  const data = await Sale.find({
    updatedAt: {
      $gte: startDate,
      $lte: endDate,
    },
    status: {
      $nin: ['awaiting payment', 'P', 'p'],
    },
    $or: [
      { refId: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ],
  })
    .populate({
      path: 'cartItems',
      populate: {
        path: 'ticketId',
        model: 'Ticket',
        select: 'name price',
      },
    })
    .populate({
      path: 'paymentDetails',
      populate: {
        path: 'option',
        model: 'PaymentOption',
        select: 'name',
      },
    })
    .sort('-createdAt')
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .exec();

  const count = await Sale.countDocuments({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
    status: {
      $nin: ['awaiting payment', 'P', 'p'],
    },
    $or: [
      { refId: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ],
  });
  res.json({ count, data });
};

export const createCheckout = async (req, res) => {
  const {
    cartItems,
    customerName,
    email,
    contactNumber,
    paymentDetails,
    promoCode,
  } = req.body;

  if (cartItems.length === 0) {
    return res.status(400).json({
      error: 'Cart is empty',
    });
  }

  const hasInvalidQuantity = cartItems.some(
    (item) => !Number.isInteger(item.qty) || item.qty <= 0,
  );

  if (hasInvalidQuantity) {
    return res.status(400).json({
      error: 'Invalid cart item quantity',
    });
  }

  if (cartItems.reduce((sum, item) => sum + item.qty, 0) === 0) {
    return res.status(400).json({
      error: 'Cart is empty',
    });
  }

  if (!customerName || !email || !contactNumber) {
    return res.status(400).json({
      error: 'Missing required customer information',
    });
  }

  let isExisting;
  let refID;

  do {
    refID = crypto.randomBytes(6).toString('hex').toUpperCase();
    isExisting = await Sale.find({ refId: refID }).exec();
  } while (isExisting.length !== 0);

  let sale = new Sale();
  let items;
  try {
    items = await Promise.all(
      cartItems.map(async (item) => {
        const currentPrice = await ticketService.getCurrentPriceById(item._id);
        return {
          ticketId: item._id,
          qty: item.qty,
          priceAcquired: currentPrice,
        };
      }),
    );
  } catch (error) {
    console.log('Error acquiring ticket prices:', error);
    return res.status(400).json({
      error: 'Error acquiring ticket prices, checkout aborted.',
    });
  }

  if (paymentDetails) {
    sale.paymentDetails = {
      option: '',
      referenceNumber: '',
      status: '',
    };
  }

  sale.expiryDate = getOpenParkExpiry();
  sale.customerName = customerName;
  sale.emailAddress = email;
  sale.refId = refID;
  sale.contactNumber = contactNumber;
  sale.cartItems = items;
  sale.status = 'awaiting payment';

  let transactionAmount = items.reduce((sum, item) => {
    return sum + item.qty * item.priceAcquired;
  }, 0);

  if (promoCode) {
    try {
      const promo = await promoService.calculatePromoDiscount(
        promoCode,
        transactionAmount,
      );
      sale.promoCode = promo.promoCode;
      sale.discount = promo.discount;
    } catch (error) {
      console.log('Error processing promo code:', error);
      return res.status(400).json({
        error: 'Promo code processing failed, checkout aborted',
      });
    }
  }

  sale.orderTotal = transactionAmount - (sale.discount || 0);

  sale.salt = Math.round(new Date().valueOf() * Math.random()) + '';
  try {
    const result = await sale.save();
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'error occured',
      message: err,
    });
  }
};

//HELPER FUNCTIONS
export const cleanUp = async (req, res) => {
  let previous2Months = new Date();
  previous2Months.setDate(previous2Months.getDate() - 90);

  //TODOS: create count documents service
  const accessPassCount =
    await accessPassService.getCountByBeforeDate(previous2Months);

  const saleCount = await Sale.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  await accessPassService.removeByBeforeDate(previous2Months);

  await Sale.deleteMany({
    createdAt: { $lte: previous2Months },
  });

  res.json({
    date: format(previous2Months, 'PPpp'),
    AccessPassDeletedCount: accessPassCount,
    saleDeletedCount: saleCount,
  });
};

export const regenerateAccessPass = async (req, res) => {
  console.log(
    'Regenerating Access Passes for sale with Reference Number: ',
    req.params.id,
  );
  if (req.params.id) {
    const sale = await Sale.findOne({ refId: req.params.id }).exec();
    if (sale) {
      await accessPassService.removeBySalesId(sale._id);
      await accessPassService.generateAccessPassesBySaleId(sale._id);
      return res.json({
        status: 'Success',
        action: 'Access Passes Regenerated',
      });
    } else {
      return res.json({ status: '404', message: 'Sale transaction not found' });
    }
  } else {
    return res.json({ status: '404', message: 'Reference ID not found' });
  }
};

export const resyncSaleByRefId = async (req, res) => {
  console.log(
    'Resyncing Access Passes for sale with Reference Number: ',
    req.params.id,
  );

  if (req.params.id) {
    const sale = await Sale.findOne({ refId: req.params.id }).exec();
    if (sale) {
      const accesspasses = await accessPassService.getBySalesId(sale._id);
      accesspasses.map(async (ap) => {
        //get ticketDetails
        const ticket = await ticketService.getById(ap.ticketId);
        await syncAccessPass(ap, ticket.itemCode);
      });
      return res.json({ status: 'Success', action: 'Sale Resynced' });
    } else {
      return res.json({ status: '404', message: 'Sale transaction not found' });
    }
  }
  return res.json({ status: '404', message: 'Reference ID not found' });
};
