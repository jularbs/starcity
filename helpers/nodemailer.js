const nodemailer = require("nodemailer");

const sendMail = async (email) => {
  try {
    var config = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      // debug: true,
      // logger: true,
      tls: {
        secure: true,
        requireTLS: true,
      },
    };

    const { from, to, subject, html } = email;
    const info = await nodemailer
      .createTransport(config)
      .sendMail({ from, to, subject, html });
    return info;
  } catch (e) {
  }
};

module.exports = { sendMail };
