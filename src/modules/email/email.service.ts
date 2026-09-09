import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

type EmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  cc?: string;
  bcc?: string;
};

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
  try {
    const { from, to, subject, html, attachments, cc, bcc } = email;
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
      cc,
      bcc,
    });
    return info;
  } catch (e) {
    console.log('ERROR IN MAILER: ', e);
  }
};

export const verifyEmailServer = async () => {
  try {
    await transporter.verify();
    console.log('Email SMTP server connection successful!');
  } catch (err) {
    console.error('Error verifying Email server: ', err);
  }
};
