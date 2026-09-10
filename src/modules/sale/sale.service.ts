import { Types } from 'mongoose';
import crypto from 'crypto';
import { saleRepository } from './sale.repository.js';
import { ticketService } from '../ticket/ticket.service.js';
import { promoService } from '../promo/promo.service.js';
import { getOpenParkExpiry } from '../../common/utils/get-expiry.js';

type CartItems = {
  _id: Types.ObjectId;
  qty: number;
};

type QRCode = {
  location: string;
  key: string;
  bucket: string;
};

type PaymentDetails = {
  option: Types.ObjectId;
  amountPaid: number;
  referenceNumber: string;
  status: string;
};

type CreateSaleInput = {
  customerName: string;
  emailAddress: string;
  contactNumber: string;
  cartItems: CartItems[];
  orderTotal: number;
  status: string;
  refId: string;
  salt: string;
  QRCode: QRCode;
  paymentDetails: PaymentDetails | undefined;
  promoCode: string | null;
  discount: number;
  expiryDate: string;
  meta: Record<string, any> | undefined;
};

type CreateCheckoutInput = Pick<
  CreateSaleInput,
  'customerName' | 'contactNumber' | 'emailAddress' | 'cartItems' | 'promoCode'
>;

type ListParamsInput = {
  skip?: number;
  limit?: number;
  startDate: string;
  endDate: string;
  searchQuery: string;
  excludedStatus?: string[];
};

async function generateNewRefId(length: number): Promise<string> {
  let isExisting;
  let refId: string;
  do {
    refId = crypto.randomBytes(length).toString('hex').toUpperCase();
    isExisting = await saleRepository.findByRefId(refId);
  } while (isExisting);
  return refId;
}

const getById = async (saleId: Types.ObjectId) => {
  return saleRepository.findBySaleId(saleId);
};

const getByIdWithDetails = async (saleId: Types.ObjectId) => {
  return saleRepository.findBySaleIdWithDetails(saleId);
};

const getByRefId = async (refId: string) => {
  return saleRepository.findByRefId(refId);
};

const getByRefIdWithDetails = async (refId: string) => {
  return saleRepository.findByRefIdWithSaleDetails(refId);
};

const getByRefIdWithSalt = async (refId: string, salt: string) => {
  const sale = await saleRepository.findByRefId(refId);
  if (sale && sale.salt === salt) {
    return sale;
  }
  return null;
};

const list = async (params: ListParamsInput) => {
  const { skip = 0, limit = 10, startDate, endDate, searchQuery } = params;

  const excludedStatus = ['awaiting payment', 'P', 'p'];
  return saleRepository.list({
    skip,
    limit,
    startDate,
    endDate,
    searchQuery,
    excludedStatus,
  });
};

const listCount = async (params: ListParamsInput) => {
  const { startDate, endDate, searchQuery } = params;

  const excludedStatus = ['awaiting payment', 'P', 'p'];
  return saleRepository.listCount({
    startDate,
    endDate,
    searchQuery,
    excludedStatus,
  });
};

const createCheckout = async (data: CreateCheckoutInput) => {
  if (data.cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const hasInvalidQuantity = data.cartItems.some(
    (item) => !Number.isInteger(item.qty) || item.qty <= 0,
  );

  if (hasInvalidQuantity) {
    throw new Error('Invalid cart item quantity');
  }

  if (data.cartItems.reduce((sum, item) => sum + item.qty, 0) === 0) {
    throw new Error('Cart is empty');
  }

  if (!data.customerName || !data.emailAddress || !data.contactNumber) {
    throw new Error('Missing required customer information');
  }

  //Get current prices
  let cartPrices: {
    ticketId: Types.ObjectId;
    qty: number;
    priceAcquired: Types.Decimal128;
  }[];

  try {
    cartPrices = await Promise.all(
      data.cartItems.map(async (item) => {
        const currentPrice = await ticketService.getCurrentPriceById(item._id);
        return {
          ticketId: item._id,
          qty: item.qty,
          priceAcquired: currentPrice,
        };
      }),
    );
  } catch (error) {
    console.error('Error acquiring ticket prices:', error);
    throw new Error('Error acquiring ticket prices, checkout aborted', {
      cause: error,
    });
  }

  let transactionAmount = cartPrices.reduce((sum, item) => {
    return sum + item.qty * parseFloat(item.priceAcquired.toString());
  }, 0);

  let promo: { promoCode: Types.ObjectId; discount: number } | null = null;

  if (data.promoCode) {
    try {
      promo = await promoService.calculatePromoDiscount(
        data.promoCode,
        transactionAmount,
      );

      transactionAmount -= promo.discount;
    } catch (error) {
      console.log('Error processing promo code:', error);
      throw new Error('Promo code processing failed, checkout aborted', {
        cause: error,
      });
    }
  }

  const refId = await generateNewRefId(8);
  const salt = crypto.randomBytes(16).toString('hex');
  const expiryDate = getOpenParkExpiry();
  const status = 'awaiting payment';

  const checkoutDetails = {
    customerName: data.customerName,
    emailAddress: data.emailAddress,
    contactNumber: data.contactNumber,
    cartItems: cartPrices,
    orderTotal: Types.Decimal128.fromString(transactionAmount.toString()),
    promoCode: promo ? promo.promoCode : null,
    discount: promo
      ? Types.Decimal128.fromString(promo.discount.toString())
      : null,
    refId,
    salt,
    expiryDate,
    status,
    paymentDetails: undefined,
    QRCode: undefined,
    meta: undefined,
  };

  return saleRepository.create(checkoutDetails);
};

const removeByBeforeDate = async (date: Date) => {
  return saleRepository.deleteByBeforeData(date);
};

const countByBeforeDate = async (date: Date) => {
  return saleRepository.countByBeforeDate(date);
};

export const saleService = {
  list,
  listCount,
  createCheckout,
  getByRefId,
  getById,
  getByIdWithDetails,
  getByRefIdWithSalt,
  getByRefIdWithDetails,
  removeByBeforeDate,
  countByBeforeDate,
};
