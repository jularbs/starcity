import nodemailer from "nodemailer";

export const sendMail = async (email) => {
  try {
    var config = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    };
    const { from, to, subject, html, attachments, cc, bcc } = email;
    const info = await nodemailer
      .createTransport(config)
      .sendMail({ from, to, subject, html, attachments, cc, bcc });
    return info;
  } catch (e) {
    console.log("ERROR IN MAILER: ", e);
  }
};