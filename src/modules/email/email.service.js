import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';

export const sendMail = async (email) => {
  try {
    var mailConfig = {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.address,
        pass: config.email.password,
      },
      tls: { rejectUnauthorized: false },
    };
    const { from, to, subject, html, attachments, cc, bcc } = email;
    const info = await nodemailer
      .createTransport(mailConfig)
      .sendMail({ from, to, subject, html, attachments, cc, bcc });
    return info;
  } catch (e) {
    console.log('ERROR IN MAILER: ', e);
  }
};
