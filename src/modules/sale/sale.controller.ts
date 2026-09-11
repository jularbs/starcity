import { ticketService } from '../ticket/ticket.service.js';
import { accessPassService } from '../accessPass/accessPass.service.js';
import { emailService } from '../email/email.service.js';
import dateFnsTz from 'date-fns-tz';
const { zonedTimeToUtc } = dateFnsTz;
import { saleService } from './sale.service.js';

export const resendAR = async (req, res) => {
  const { refId } = req.body;
  try {
    const sale = await saleService.getByRefId(refId);
    await emailService.sendAcknowledgementReceiptBySaleId(sale._id);
    res.json({ message: 'E-mail resent successfully.' });
  } catch (error) {
    console.log('Error: ', error);
    res.status(400).json({ message: 'E-mail failed. Please try again later.' });
  }
};

export const readBySaltRefID = async (req, res) => {
  const { salt, refid } = req.query;

  const saleData = await saleService.getByRefIdWithSalt(refid, salt);

  if (saleData == null) return res.status(400).json({ error: 'Invalid Data' });

  const accessPasses = await accessPassService.getBySalesId(saleData._id);

  res.json({ details: saleData, accessPasses });
};

export const read = async (req, res) => {
  try {
    const data = await saleService.getByRefIdWithDetails(req.params.refid);
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

  const data = await saleService.list({
    skip: parseInt(skip),
    limit: parseInt(limit),
    startDate,
    endDate,
    searchQuery: search,
  });

  const count = await saleService.listCount({
    startDate,
    endDate,
    searchQuery: search,
  });
  res.json({ count, data });
};

export const createCheckout = async (req, res) => {
  const { cartItems, customerName, email, contactNumber, promoCode } = req.body;

  try {
    const result = await saleService.createCheckout({
      cartItems,
      customerName,
      emailAddress: email,
      contactNumber,
      promoCode: promoCode,
    });
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: err.message || 'error occured',
    });
  }
};

export const regenerateAccessPass = async (req, res) => {
  console.log(
    'Regenerating Access Passes for sale with Reference Number: ',
    req.params.id,
  );
  if (req.params.id) {
    const sale = await saleService.getByRefId(req.params.id);
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
    const sale = await saleService.getByRefId(req.params.id);
    if (sale) {
      const accesspasses = await accessPassService.getBySalesId(sale._id);
      accesspasses.map(async (ap) => {
        //get ticketDetails
        const ticket = await ticketService.getById(ap.ticketId);
        await accessPassService.syncAccessPass(ap, ticket.itemCode);
      });
      return res.json({ status: 'Success', action: 'Sale Resynced' });
    } else {
      return res.json({ status: '404', message: 'Sale transaction not found' });
    }
  }
  return res.json({ status: '404', message: 'Reference ID not found' });
};
