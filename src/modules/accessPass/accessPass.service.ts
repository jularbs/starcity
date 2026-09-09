import { accessPassRepository } from './accessPass.repository.js';
import Sale from '../sale/sale.model.js';
import type { Types } from 'mongoose';
import { ticketService } from '../ticket/ticket.service.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { format } from 'date-fns';
import { turnstileSyncService } from '../turnstileSync/turnstileSync.service.js';
import { accessPassQueueService } from '../accessPassQueue/accessPassQueue.service.js';
import { config } from '../../config/index.js';

type CreateAccessPassInput = {
  ticketId: Types.ObjectId;
  salesId: Types.ObjectId;
  accessToken: string;
  status: string;
  expiryDate: string;
  QRcode: {
    location: string;
    bucket: string;
    key: string;
  };
};

const create = async (accessPassData: CreateAccessPassInput) => {
  //TODOS: validation if ticketId and salesId exists

  //validate that access token is unique
  const existingAccessPass = await accessPassRepository.findByAccessToken(
    accessPassData.accessToken,
  );
  if (existingAccessPass) {
    throw new Error('Access token must be unique');
  }

  return accessPassRepository.create(accessPassData);
};

const removeBySalesId = async (salesId: Types.ObjectId) => {
  return accessPassRepository.deleteBySalesId(salesId);
};

const removeByBeforeDate = async (date: string) => {
  return accessPassRepository.deleteByBeforeDate(date);
};

const getCountByBeforeDate = async (date: string) => {
  return accessPassRepository.countByBeforeDate(date);
};

const getBySalesId = async (salesId: Types.ObjectId) => {
  return accessPassRepository.findBySalesId(salesId);
};

const getByAccessToken = async (accessToken: string) => {
  return accessPassRepository.findByAccessToken(accessToken);
};

const getInRange = async (startDate: string, endDate: string) => {
  return accessPassRepository.findInRange(startDate, endDate);
};

const generateValidToken = async (itemCode: string) => {
  let isExisting;
  let finalToken: string;

  do {
    finalToken = `W-${itemCode}-${crypto.randomBytes(4).toString('hex')}`;
    finalToken = finalToken.toUpperCase();
    isExisting = await accessPassRepository.findByAccessToken(finalToken);
  } while (isExisting);

  return finalToken;
};

const generateQRCode = async (text: string) => {
  return QRCode.toDataURL(text, {
    version: 4,
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 1,
    margin: 5,
    width: 300,
    height: 300,
  });
};

const syncAccessPass = async (accessPass, _RideCode) => {
  if (!config.app.isTurnstileSyncEnabled) {
    console.log('Access Pass Syncing is disabled');
    return;
  }
  try {
    await turnstileSyncService.addAccessPassToTurnstile({
      accesspassCode: accessPass.accessToken,
      origin: 'web',
      expiry: accessPass.expiryDate,
      date: accessPass.createdAt,
    });
  } catch (err) {
    console.log('ERROR IN SYNCING ACCESS PASS: ', err);
    accessPassQueueService.createQueue(accessPass._id, 'Failed Insert');
  }
};

const generateAccessPassesBySaleId = async (saleId: Types.ObjectId) => {
  // TODOS: refactor to use sale service
  const sale = await Sale.findById(saleId);

  const cartItems = sale.cartItems;

  cartItems.map(async (item) => {
    // generate access passes for each cart item
    const ticket = await ticketService.getById(item.ticketId);

    for (let i = 0; i < item.qty; i++) {
      const finalToken = await generateValidToken(ticket.itemCode);
      const base64 = await generateQRCode(finalToken);

      const date = new Date();
      const month = date.getUTCMonth() + 1; //months from 1-12
      const year = date.getUTCFullYear();
      const upload = await uploadFile(
        base64,
        `access-pass/${year}/${month}/${sale.refId}`,
        300,
      );

      const accessPassData = {
        ticketId: item.ticketId,
        salesId: sale._id,
        accessToken: finalToken,
        expiryDate: `${format(
          new Date(sale.expiryDate),
          'yyyy-LL-dd',
        )} 23:59:59`,
        QRcode: upload,
        status: 'for sync',
      };

      const result = await accessPassRepository.create(accessPassData);
      console.log(`Access pass created for token: ${finalToken}`);
      await syncAccessPass(result, ticket.itemCode);
    }
  });
};

export const accessPassService = {
  create,
  removeBySalesId,
  removeByBeforeDate,
  getBySalesId,
  getByAccessToken,
  getInRange,
  getCountByBeforeDate,
  generateAccessPassesBySaleId,
};
