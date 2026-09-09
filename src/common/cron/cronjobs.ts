//TODOS: Needs regression testing for all.
// Focus on currency amounts for accuracy (Number vs ParseFloat)
import SmQueue from '../../modules/smTickets/smQueue.model.js';
import EmailQueue from '../../modules/email/emailQueue.model.js';
import Sale from '../../modules/sale/sale.model.js';
import AccessPass from '../../modules/accessPass/accessPass.model.js';
import PaymentOption from '../../modules/paymentOption/paymentOption.model.js';
import Ticket from '../../modules/ticket/ticket.model.js';

import { pool } from '../../database/mysql/index.js';
import { auditTrailService } from '../../modules/auditTrail/auditTrail.service.js';
import { format } from 'date-fns';
import { sendMail } from '../../modules/email/email.service.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import dateFnsTz from 'date-fns-tz';

import { sendAR } from '../../modules/sale/sale.controller.js';
import { config } from '../../config/index.js';
import { accessPassQueueService } from '../../modules/accessPassQueue/accessPassQueue.service.js';
import { accessPassService } from '../../modules/accessPass/accessPass.service.js';
import { ticketService } from '../../modules/ticket/ticket.service.js';
import { paymentOptionService } from '../../modules/paymentOption/paymentOption.service.js';
const { zonedTimeToUtc, utcToZonedTime } = dateFnsTz;

export const cronSyncAP = async () => {
  const queues = await accessPassQueueService.listQueues();

  if (queues.length > 0) {
    console.log('**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****');
    console.log('Number of Queues: ', queues.length);
    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log('CONNECTION ERRER: ', err);
        } else {
          queues.map((q) => {
            const accessPass = q.accessPass as unknown as InstanceType<
              typeof AccessPass
            >;
            const date = format(accessPass.createdAt, 'yyyy-MM-dd');
            const time = format(accessPass.createdAt, 'HH:mm:ss');

            //extract itemCode from AccessToken
            const RideCode = accessPass.accessToken.match('-(.*)-')[1];

            const values = [
              [
                accessPass.accessToken,
                'Pop Tag',
                date,
                time,
                'Purchased',
                'web',
                '1',
                RideCode,
              ],
            ];

            const sql =
              'INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode) VALUES ?;';

            connection.query(sql, [values], async function (error, results) {
              if (error) {
                console.log('FAILED TO SYNC: ', accessPass.accessToken);
                auditTrailService.create({
                  user: 'Cron Job',
                  action: `System failed to sync Access Pass: ${accessPass.accessToken}`,
                });
              } else if (results.affectedRows < 1) {
                console.log(
                  `UNABLE TO INSERT TO DATABASE ACCESS TOKEN: `,
                  accessPass.accessToken,
                );
              } else {
                //remove in queue;
                await accessPassQueueService.removeQueue(q._id);
                console.log(
                  'ACCESSPASS SUCCESS FOR ID: ',
                  accessPass.accessToken,
                );
              }
            });
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

export const cronSyncSMTickets = async () => {
  const queues = await SmQueue.find({}).exec();

  if (queues.length > 0) {
    console.log('**** RUNNING SM TICKETES SYNC WITH TURNSTILE ****');
    console.log('Number of Queues: ', queues.length);

    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log('CONNECTION ERRER: ', err);
          return;
        }

        queues.map((q) => {
          const date = format(q.createdAt, 'yyyy-MM-dd');
          const time = format(q.createdAt, 'HH:mm:ss');
          const expiry = q.ticketExpiry;
          const ticketType = q.RideCode;
          const values = [
            [
              q.tokenID,
              'Pop Tag',
              date,
              time,
              'Purchased',
              'smticket',
              '1',
              ticketType,
              expiry,
            ],
          ];

          const sql =
            'INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode, expiration_date) VALUES ?;';

          connection.query(sql, [values], async function (error, results) {
            //if Error: do not remove in queue
            if (error) {
              console.log('Unable to process SM Queue: ', error);
              return;
            }

            if (results.affectedRows < 1) {
              console.log('Unable to process SM Queue: no affected rows');
              return;
            }

            // no error (remove from queue);
            console.log('SM Queue Processed for tokenID: ', q.tokenID);
            await SmQueue.deleteOne({ tokenID: q.tokenID }).exec();
            return;
          });
        });
      });
    } catch (e) {
      console.log('Error on MySQL Connection: ');
      console.log(e);
      return;
    }
  }
};

export const cronProcessEmailQueues = async () => {
  const Qs = await EmailQueue.find().exec();
  if (Qs.length > 0) {
    console.log('**** PROCESSING QUEUED EMAIL ****');
    console.log('Number of Queued emails: ', Qs.length);

    Qs.map(async (q) => {
      //remove q from database
      await EmailQueue.deleteOne({ _id: q._id }).exec();
      try {
        const isResolved = await sendAR(q.refId);
        if (!isResolved) {
          console.log('Email not sent. Refid requeued');
        }
      } catch (error) {
        console.log('Error processing queued email for RefId: ', q.refId);
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

  const saleCount = await Sale.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  await Sale.deleteMany({
    createdAt: { $lte: previous2Months },
  });

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

  const start = zonedTimeToUtc(`${datetime}T00:00:00.000`, 'Asia/Manila');
  const end = zonedTimeToUtc(`${datetime}T23:59:59.999`, 'Asia/Manila');

  //Works only when server is PHT set.
  //set date range to be covered
  // const start = startOfYesterday();
  // const end = endOfYesterday();

  //get sales data in date range
  const salesData = await Sale.find({
    status: {
      $nin: ['awaiting payment', 'P', 'p'],
    },
    updatedAt: {
      $gte: start,
      $lte: end,
    },
  })
    .select(
      'updatedAt customerName emailAddress contactNumber refId contactnumber orderTotal paymentDetails cartItems',
    )
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
    .exec();

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
        utcToZonedTime(data.updatedAt, 'Asia/Manila'),
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
    <h1>Sales Summary for ${format(utcToZonedTime(start, 'Asia/Manila'), 'PPp')} - ${format(utcToZonedTime(end, 'Asia/Manila'), 'PPp')} </h1>
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

  const start = zonedTimeToUtc(`${datetime}T00:00:00.000`, 'Asia/Manila');
  const end = zonedTimeToUtc(`${datetime}T23:59:59.999`, 'Asia/Manila');

  const accessPassData = await accessPassService.getInRange(
    start.toISOString(),
    end.toISOString(),
  );

  const dataArray = accessPassData.map((data) => {
    return {
      generationDate: format(
        utcToZonedTime(data.createdAt, 'Asia/Manila'),
        'PPp',
      ),
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
    <h1>QR Values Delivery Report for ${format(utcToZonedTime(start, 'Asia/Manila'), 'PPp')} - ${format(utcToZonedTime(end, 'Asia/Manila'), 'PPp')} </h1>
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
