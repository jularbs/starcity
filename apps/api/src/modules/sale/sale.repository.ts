import { Types } from 'mongoose';
import Sale from './sale.model.js';

type CartItems = {
  ticketId: Types.ObjectId;
  qty: number;
  priceAcquired: Types.Decimal128;
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

type CreateSale = {
  customerName: string;
  emailAddress: string;
  contactNumber: string;
  cartItems: CartItems[];
  orderTotal: Types.Decimal128;
  status: string;
  refId: string;
  salt: string;
  QRCode: QRCode | undefined;
  paymentDetails: PaymentDetails | undefined;
  promoCode: Types.ObjectId | null;
  discount: Types.Decimal128;
  expiryDate: string;
  meta: Record<string, any> | undefined;
};

type ListParams = {
  skip?: number;
  limit?: number;
  startDate: string;
  endDate: string;
  searchQuery: string;
  excludedStatus?: string[];
};

const findBySaleId = async (saleId: Types.ObjectId) => {
  return Sale.findById(saleId);
};
const findBySaleIdWithDetails = async (saleId: Types.ObjectId) => {
  return Sale.findById(saleId)
    .populate({
      path: 'paymentDetails',
      populate: {
        path: 'option',
        model: 'PaymentOption',
        select: 'name',
      },
    })
    .populate({
      path: 'cartItems',
      populate: {
        path: 'ticketId',
        model: 'Ticket',
        select: 'name -_id',
      },
    });
};

const findByRefId = async (refId: string) => {
  return Sale.findOne({ refId });
};

const findByRefIdWithSaleDetails = async (refId: string) => {
  return Sale.findOne({ refId })
    .populate({
      path: 'paymentDetails',
      populate: {
        path: 'option',
        model: 'PaymentOption',
        select: 'name',
      },
    })
    .populate({
      path: 'cartItems',
      populate: {
        path: 'ticketId',
        model: 'Ticket',
        select: 'name -_id',
      },
    });
};

const create = async (data: CreateSale) => {
  return Sale.create(data);
};

const list = async (params: ListParams) => {
  return Sale.find({
    updatedAt: {
      $gte: new Date(params.startDate),
      $lte: new Date(params.endDate),
    },
    ...(params.excludedStatus
      ? { status: { $nin: params.excludedStatus } }
      : {}),
    $or: [
      { refId: { $regex: params.searchQuery, $options: 'i' } },
      { customerName: { $regex: params.searchQuery, $options: 'i' } },
      { emailAddress: { $regex: params.searchQuery, $options: 'i' } },
      { contactNumber: { $regex: params.searchQuery, $options: 'i' } },
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
    .sort('-updatedAt')
    .skip(params.skip ?? 0)
    .limit(params.limit ?? 10);
};

const listCount = async (params: ListParams) => {
  return Sale.countDocuments({
    updatedAt: {
      $gte: new Date(params.startDate),
      $lte: new Date(params.endDate),
    },
    ...(params.excludedStatus
      ? { status: { $nin: params.excludedStatus } }
      : {}),
    $or: [
      { refId: { $regex: params.searchQuery, $options: 'i' } },
      { customerName: { $regex: params.searchQuery, $options: 'i' } },
      { emailAddress: { $regex: params.searchQuery, $options: 'i' } },
      { contactNumber: { $regex: params.searchQuery, $options: 'i' } },
    ],
  });
};

const updateById = async (
  saleId: Types.ObjectId,
  data: Partial<CreateSale>,
) => {
  return Sale.findByIdAndUpdate(saleId, data, { returnDocument: 'after' });
};

const removeById = async (saleId: Types.ObjectId) => {
  return Sale.findByIdAndDelete(saleId);
};

const deleteByBeforeData = async (date: Date) => {
  return Sale.deleteMany({
    createdAt: { $lte: date },
  });
};

const countByBeforeDate = async (date: Date) => {
  return Sale.countDocuments({
    createdAt: { $lte: date },
  });
};

export const saleRepository = {
  removeById,
  deleteByBeforeData,
  countByBeforeDate,
  create,
  updateById,
  list,
  findBySaleId,
  findBySaleIdWithDetails,
  findByRefId,
  findByRefIdWithSaleDetails,
  listCount,
};
