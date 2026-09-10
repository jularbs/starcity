import { format } from 'date-fns';
import { config } from '../../../config/index.js';
import { turnstileSyncService } from '../../turnstileSync/turnstileSync.service.js';
import { getOpenParkExpiry } from '../../../common/utils/get-expiry.js';
import { smTicketService } from './smTicket.service.js';

export const smTicketTest = async (req, res) => {
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

  try {
    await Promise.all(
      tickets.map(async (item) => {
        const { ticketID, ticketType, ticketExpiry } = item;
        try {
          await smTicketService.create({
            tokenId: ticketID,
            ticketType: ticketType,
            ...(ticketExpiry && { ticketExpiry }),
          });
        } catch (err) {
          console.log(err);
        }
      }),
    );
  } catch (err) {
    console.log('ERROR IN PROCESSING SM TICKETS: ', err);
  }

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

  try {
    await Promise.all(
      tickets.map(async (item) => {
        const { ticketID } = item;
        await smTicketService.void(ticketID);
      }),
    );
  } catch {
    return res.status(500).json({
      status: 'Internal Server Error',
      message: 'Cannot connect to Turnstile System',
    });
  }

  res.status(200).json({
    status: 'Success',
    message: 'Tickets voided successfully',
  });
};
