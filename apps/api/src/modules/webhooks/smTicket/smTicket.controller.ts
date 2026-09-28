import { format } from 'date-fns';
import { getOpenParkExpiry } from '../../../common/utils/get-expiry.js';
import { smTicketService } from './smTicket.service.js';
import type { Request, Response } from 'express';

export const smTicketTest = async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Connection Test Success',
  });
};

export const smTicketExpiry = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    // expiry: getOpenParkExpiry(),
    expiry: `${format(new Date(getOpenParkExpiry()), 'yyyy-LL-dd')} 23:59:59`,
  });
};

export const smTicketTransact = async (req: Request, res: Response) => {
  const { tickets, token } = req.body;

  await smTicketService.processTransaction(tickets, token);

  res.status(200).json({
    status: 'Success',
    message: 'Tickets synchronized successfully',
  });
};

export const smTicketVoid = async (req: Request, res: Response) => {
  console.log('VOIDING SM TICKET TRANSACTION...');
  const { token, tickets } = req.body;

  await smTicketService.voidTransaction(tickets, token);

  res.status(200).json({
    status: 'Success',
    message: 'Tickets voided successfully',
  });
};
