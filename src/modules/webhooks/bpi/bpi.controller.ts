import { saleService } from '../../sale/sale.service.js';
import { paymentOptionService } from '../../paymentOption/paymentOption.service.js';
import { accessPassService } from '../../accessPass/accessPass.service.js';
import { config } from '../../../config/index.js';
import { emailService } from '../../email/email.service.js';

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
    const sale = await saleService.getByRefId(merchantTransactionReference);
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
            await accessPassService.generateAccessPassesBySaleId(result._id);
            console.log('SENDING ACKNOWLEDGEMENT RECEIPT');
            await emailService.sendAcknowledgementReceiptBySaleId(result._id);
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
