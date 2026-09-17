//TODOS: Needs regression testing for all.
// Focus on currency amounts for accuracy (Number vs ParseFloat)
import Sale from '../../modules/sale/sale.model.js';
import AccessPass from '../../modules/accessPass/accessPass.model.js';
import PaymentOption from '../../modules/paymentOption/paymentOption.model.js';
import Ticket from '../../modules/ticket/ticket.model.js';

import { auditTrailService } from '../../modules/auditTrail/auditTrail.service.js';
import { format } from 'date-fns';
import { sendMail } from '../../modules/email/email.service.js';
import { emailQueueService } from '../../modules/email/emailQueue.service.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { config } from '../../config/index.js';
import { accessPassQueueService } from '../../modules/accessPassQueue/accessPassQueue.service.js';
import { accessPassService } from '../../modules/accessPass/accessPass.service.js';
import { ticketService } from '../../modules/ticket/ticket.service.js';
import { paymentOptionService } from '../../modules/paymentOption/paymentOption.service.js';
import { turnstileSyncService } from '../../modules/turnstileSync/turnstileSync.service.js';
import { saleService } from '../../modules/sale/sale.service.js';
import { smQueueService } from '../../modules/webhooks/smTicket/smQueue.service.js';

export const cronSyncAP = async () => {
  const queues = await accessPassQueueService.listQueues();

  if (queues.length > 0) {
    console.log('**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****');
    console.log('Number of Queues: ', queues.length);

    queues.map(async (q) => {
      const accessPass = q.accessPass as unknown as InstanceType<
        typeof AccessPass
      >;
      try {
        await turnstileSyncService.addAccessPassToTurnstile({
          accesspassCode: accessPass.accessToken,
          origin: 'web',
          date: accessPass.createdAt.toISOString(),
          expiry: accessPass.expiryDate,
        });
        await accessPassQueueService.removeQueue(q._id);
      } catch (error) {
        console.log('error in syncing access pass: ', error);
        auditTrailService.create({
          user: 'Cron Job',
          action: `System failed to sync Access Pass: ${accessPass.accessToken}`,
        });
      }
    });
  }
};

export const cronSyncSMTickets = async () => {
  const queues = await smQueueService.list();

  if (queues.length > 0) {
    console.log('**** RUNNING SM TICKETS SYNC WITH TURNSTILE ****');
    console.log('Number of Queues: ', queues.length);

    queues.map(async (q) => {
      try {
        await turnstileSyncService.addAccessPassToTurnstile({
          accesspassCode: q.tokenID,
          origin: 'smticket',
          date: q.createdAt.toISOString(),
          expiry: q.ticketExpiry,
        });
        await smQueueService.remove(q.tokenID);
      } catch (error) {
        console.log('Error processing SM Queue item: ', error);
      }
    });
  }
};

export const cronProcessEmailQueues = async () => {
  const Qs = await emailQueueService.listReady();
  if (Qs.length > 0) {
    console.log('**** PROCESSING QUEUED EMAIL ****');
    console.log('Number of Queued emails: ', Qs.length);

    Qs.map(async (q) => {
      try {
        await sendMail(q.toObject());
        await emailQueueService.remove(q._id);
      } catch (error) {
        await emailQueueService.recordFailure(q._id, error);
        console.log('Error processing queued email: ', q._id);
        console.log('Error: ', error);
      }
    });
  }
};

export const dbcleanup = async () => {
  const previous2Months = new Date();
  previous2Months.setDate(
    previous2Months.getDate() - config.app.dataRetentionDays,
  );

  console.log('**** CLEANING UP DATABASE ****');

  const saleCount = await saleService.countByBeforeDate(previous2Months);

  await saleService.removeByBeforeDate(previous2Months);

  console.log(
    'Database clean up: Removing data before -',
    format(previous2Months, 'PPpp'),
  );
  console.log('Database clean up: Deleted Sales Data -', saleCount);
};

export const generateDailyReport = async () => {
  console.log('Generating Daily Report');

  //Works only when server is UTC set.
  const datetime = new Date().toISOString().split('T')[0];

  const start = fromZonedTime(`${datetime}T00:00:00.000`, 'Asia/Manila');
  const end = fromZonedTime(`${datetime}T23:59:59.999`, 'Asia/Manila');

  //Works only when server is PHT set.
  //set date range to be covered
  // const start = startOfYesterday();
  // const end = endOfYesterday();

  //get sales data in date range
  const salesData = await saleService.list({
    skip: 0,
    limit: Number.MAX_SAFE_INTEGER,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    searchQuery: '',
  });

  //Initialize Summary Values
  let numOfTransaction = 0;
  let totalTransactionPrice = 0;
  let ticketsSold = 0;

  //Initialize Tickets Summary Values
  const ticketsData = await ticketService.list({ status: true });

  const ticketsArray = ticketsData.map((ticket) => {
    return { id: ticket._id, name: ticket.name, qty: 0 };
  });

  //Initialize Payment Details Summary
  const paymentsData = await paymentOptionService.list({});

  const paymentsArray = paymentsData.map((po) => {
    return { id: po._id, name: po.name, qty: 0, amount: 0 };
  });

  const dataArray = salesData.map((data) => {
    numOfTransaction += 1;
    totalTransactionPrice += Number(data.orderTotal);

    //update payment option counter
    const paymentOptionIndex = paymentsArray.findIndex(
      (obj) =>
        obj.name ==
        (
          data.paymentDetails?.option as unknown as InstanceType<
            typeof PaymentOption
          >
        )?.name,
    );
    if (paymentOptionIndex !== -1) {
      paymentsArray[paymentOptionIndex].qty += 1;
      paymentsArray[paymentOptionIndex].amount += Number(
        data.orderTotal.toString(),
      );
    }

    return {
      confirmationTime: format(
        toZonedTime(data.updatedAt, 'Asia/Manila'),
        'PPp',
      ),
      customerName: data.customerName,
      transactionNumber: data.refId,
      paymentGateway: (
        data.paymentDetails?.option as unknown as InstanceType<
          typeof PaymentOption
        >
      )?.name,
      ticketType: `${convertArrayToCSV(
        data.cartItems.map((ticket) => {
          ticketsSold += ticket.qty;

          const populatedTicket = ticket.ticketId as unknown as InstanceType<
            typeof Ticket
          >;

          //update tickets counter
          const ticketIndex = ticketsArray.findIndex(
            (obj) => obj.name == populatedTicket?.name,
          );
          if (ticketIndex !== -1) {
            ticketsArray[ticketIndex].qty += ticket.qty;
          }

          return [populatedTicket?.name, ticket.qty, populatedTicket?.price];
        }),
      )}\n`,
      price: Number(data.orderTotal).toFixed(2),
      emailAddress: data.emailAddress,
      mobileNumber: data.contactNumber,
    };
  });

  const salesDataCSV = convertArrayToCSV(dataArray);

  const details = {
    to: config.app.reportsRecipient,
    from: config.email.address,
    subject: `Sales Summary for ${datetime}`,
    html: `
    <h1>Sales Summary for ${format(toZonedTime(start, 'Asia/Manila'), 'PPp')} - ${format(toZonedTime(end, 'Asia/Manila'), 'PPp')} </h1>
    <p>Total Number of Transactions: ${numOfTransaction}</p>
    <p>Total Price of Transactions: ₱${Number(totalTransactionPrice).toFixed(2)}</p>
    <p>Total Number of Tickets Sold: ${ticketsSold}</p>

    <h2>Tickets Summary</h2>
    ${ticketsArray
      .map((row) => {
        return `<p>${row.name}: ${row.qty}</p>`;
      })
      .join('')}
    <h2>Payment Channel Summary</h2>
    ${paymentsArray
      .map((row) => {
        const ticketCounter = ticketsData.map((ticket) => {
          return { name: ticket.name, qty: 0 };
        });

        salesData.map((data) => {
          if (
            (
              data.paymentDetails?.option as unknown as InstanceType<
                typeof PaymentOption
              >
            )?.name === row.name
          ) {
            data.cartItems.map((ticket) => {
              const populatedTicket =
                ticket.ticketId as unknown as InstanceType<typeof Ticket>;
              const ticketIndex = ticketCounter.findIndex(
                (obj) => obj.name == populatedTicket?.name,
              );
              if (ticketIndex !== -1) {
                ticketCounter[ticketIndex].qty += ticket.qty;
              }
            });
          }
        });

        return `<h4>${row.name}</h4>
              <p style="margin-left: 20px">Transactions: ${row.qty}</p>
              <p style="margin-left: 20px">Amount: ₱${Number(row.amount).toFixed(2)}</p>
              ${ticketCounter
                .map((counter) => {
                  return `<p style="margin-left: 20px">${counter.name}: ${counter.qty}</p>`;
                })
                .join('')}`;
      })
      .join('')}
    `,
    attachments: [
      {
        filename: `Daily Sales Data - ${format(start, 'PP')}.csv`,
        content: salesDataCSV, // attaching csv in the content
      },
    ],
  };

  try {
    //TODOS: Refactor to use emailService instead of sendMail directly
    sendMail(details).then((info) => {
      console.log('Email Report Info: ', info);
      //check info if undefined
      if (info === undefined) {
        //create email queue
      } else {
        console.log('Daily Report Sent');
      }
    });
  } catch (e) {
    console.log(e);
    console.log('Failed trying to send daily report');
  }
};

export const generateQRdeliveryReport = async () => {
  console.log('Generating QR Delivery Report');

  //Works only when server is UTC set.
  const datetime = new Date().toISOString().split('T')[0];

  const start = fromZonedTime(`${datetime}T00:00:00.000`, 'Asia/Manila');
  const end = fromZonedTime(`${datetime}T23:59:59.999`, 'Asia/Manila');

  const accessPassData = await accessPassService.getInRange(
    start.toISOString(),
    end.toISOString(),
  );

  const dataArray = accessPassData.map((data) => {
    return {
      generationDate: format(toZonedTime(data.createdAt, 'Asia/Manila'), 'PPp'),
      referenceNumber: (data.salesId as unknown as InstanceType<typeof Sale>)
        ?.refId,
      ticketType: (data.ticketId as unknown as InstanceType<typeof Ticket>)
        ?.name,
      accessToken: data.accessToken,
    };
  });

  const accessPassDataCSV = convertArrayToCSV(dataArray);

  const details = {
    to: config.app.reportsRecipient,
    from: config.email.address,
    subject: `QR Values Delivery Report for ${datetime}`,
    html: `
    <h1>QR Values Delivery Report for ${format(toZonedTime(start, 'Asia/Manila'), 'PPp')} - ${format(toZonedTime(end, 'Asia/Manila'), 'PPp')} </h1>
    <p>Total Number of QR Values Delivered: ${accessPassData.length}</p>
    `,
    attachments: [
      {
        filename: `QR Values Delivery Data - ${format(start, 'PP')}.csv`,
        content: accessPassDataCSV, // attaching csv in the content
      },
    ],
  };

  try {
    //TODOS: Refactor to use emailService instead of sendMail directly
    sendMail(details).then((info) => {
      console.log('QR Report Info: ', info);
      //check info if undefined
      if (info === undefined) {
        //create email queue
      } else {
        console.log('QR Values Delivery Report Sent');
      }
    });
  } catch (e) {
    console.log(e);
    console.log('Failed trying to send QR Values delivery report');
  }
};
