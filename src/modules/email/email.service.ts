import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { saleService } from '../sale/sale.service.js';
import handlebars from 'handlebars';
import juice from 'juice';
import fs from 'node:fs/promises'; // Use Node 22 native promise-based fs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Types } from 'mongoose';
import { emailQueueService, type QueuedEmail } from './emailQueue.service.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, 'templates');

export type EmailInput = QueuedEmail;

const mailConfig = {
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.address,
    pass: config.email.password,
  },
  tls: { rejectUnauthorized: false },
};

const transporter = nodemailer.createTransport(mailConfig);

export const sendMail = async (email: EmailInput) => {
  const { from, to, subject, html, attachments, cc, bcc } = email;
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
    cc,
    bcc,
  });
};

export const verifyEmailServer = async () => {
  try {
    await transporter.verify();
    console.log('Email SMTP server connection successful!');
  } catch (err) {
    console.error('Error verifying Email server: ', err);
  }
};

const buildHtmlFromTemplate = async (templateName: string, data: any) => {
  const templatePath = path.join(templateDir, `${templateName}.hbs`);
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  return juice(template(data));
};

export const emailService = {
  sendAcknowledgementReceiptBySaleId: async (saleId: Types.ObjectId) => {
    // TODOS: refactor to use saleService
    const sale = await saleService.getByIdWithDetails(saleId);

    const html = await buildHtmlFromTemplate('accessPassEmailNotification', {
      ...sale.toObject(),
      websiteUrl: config.app.websiteUrl,
    });

    const emailInput: EmailInput = {
      from: config.email.address,
      to: sale.emailAddress,
      subject:
        'Your acknowledgement receipt for your Star City ticket purchase',
      html,
    };

    try {
      await sendMail(emailInput);
    } catch (e) {
      console.log('Error sending Acknowledgement Receipt: ', e);
      await emailQueueService.enqueue({
        ...emailInput,
        type: 'acknowledgement-receipt',
      });
    }
  },
};
