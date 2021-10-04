const Sale = require("../models/sale");
const Ticket = require("../models/ticket");
const PaymentOption = require("../models/paymentOption");
const AccessPass = require("../models/accessPass");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { uploadBase64 } = require("../helpers/s3uploader");
const mongoose = require("mongoose");

const { sendMail } = require("../helpers/nodemailer");
const nodemailer = require("nodemailer");

const html_to_pdf = require("html-pdf-node");

const { artemplate } = require("../helpers/artemplate");
//HELPERS
exports.getCurrentTicketPrice = (ticket) => {
  return new Promise((resolve, reject) => {
    const { ticketId } = ticket;
    Ticket.findOne({ _id: new mongoose.Types.ObjectId(`${ticketId}`) }).exec(
      (err, result) => {
        if (err) reject(err);
        return resolve({ price: result.price });
      }
    );
  });
};

exports.asyncGetTicketPrice = async (ticket) => {
  return this.getCurrentTicketPrice(ticket);
};

exports.calculateCartItem = (item) => {
  return new Promise((resolve, reject) => {
    const { ticketId, qty } = item;
    Ticket.findOne({ _id: ticketId }).exec((err, result) => {
      if (err) reject(err);
      return resolve({ amount: qty * result.price });
    });
  });
};

exports.calculateCart = (cartItems) => {
  return Promise.all(cartItems.map((item) => this.calculateCartItem(item)));
};

//REQUESTS
exports.sync = async (req, res) => {
  Sale.find({ status: "for sync" })
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name -_id",
      },
    })
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name -_id",
      },
    })
    .select(
      "customerName cartItems orderTotal paymentDetails refId created_at -_id"
    )
    .exec(async (err, data) => {
      if (err) res.json({ error: "Failed to synchronize", message: err });
      await Sale.updateMany(
        { status: "for sync" },
        { status: "synced undelivered" },
        () => {}
      );

      res.json(data);
    });
};

exports.create = async (req, res) => {
  const { name, email, cartItems, paymentDetails } = req.body;

  let isExisting = [];
  let refID = "";

  do {
    refID = crypto.randomBytes(15).toString("hex");
    isExisting = await Sale.find({ refId: refID }).exec();
  } while (isExisting.length !== 0);

  let sale = new Sale();
  sale.customerName = name;
  sale.emailAddress = email;
  sale.refId = refID;
  const cart = await Promise.all(
    cartItems.map(async (item) => {
      const { price } = await this.getCurrentTicketPrice(item);
      return {
        ticketId: item.ticketId,
        qty: item.qty,
        priceAcquired: price,
      };
    })
  );

  sale.cartItems = cart;
  //compute for order total
  sale.orderTotal = await (
    await this.calculateCart(cartItems)
  ).reduce((a, b) => a.amount + b.amount);

  sale.paymentDetails = paymentDetails;

  let base64 = await QRCode.toDataURL(refID, {
    version: 4,
    errorCorrectionLevel: "H",
    type: "image/jpeg",
    quality: 1,
    margin: 5,
    width: 250,
    height: 250,
  });
  sale.QRcode = await uploadBase64(await base64, `qrcode/${name}`);

  sale.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

    res.json(result);
  });
};

exports.readBySaltRefID = async (req, res) => {
  const saleDetails = await Sale.findOne({
    salt: req.query.salt,
    refId: req.query.refid,
  })
    .select("_id customerName emailAddress contactNumber")
    .exec();

  if (saleDetails == null) res.json({ error: "Invalid Data" });

  const accessPasses = await AccessPass.find({
    salesId: saleDetails._id,
  })
    .populate("ticketId", "name -_id")
    .select("ticketId QRcode accessToken -_id")
    .exec();

  res.json({ details: saleDetails, accessPasses });
};

exports.read = (req, res) => {
  Ticket.findOne({ slug: req.params.slug })
    .select("name description slug price status")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
};

exports.list = (req, res) => {
  Sale.find()
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name price",
      },
    })
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name",
      },
    })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
};

exports.update = async (req, res) => {
  const { name, slug, description, price, status } = req.body;

  const ticket = await Ticket.findOne({ slug: slug }).exec();

  ticket.name = name;
  ticket.description = description;

  ticket.price = price;
  ticket.status = status;

  ticket.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ result, status: "success" });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  Ticket.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ success: "Ticket deleted successfully" });
  });
};

exports.createCheckout = async (req, res) => {
  const { cartItems, customerName, email, contactNumber } = req.body;

  let isExisting = [];
  let refID = "";

  do {
    refID = crypto.randomBytes(6).toString("hex").toUpperCase();
    isExisting = await Sale.find({ refId: refID }).exec();
  } while (isExisting.length !== 0);

  let sale = new Sale();

  //error when only 1 item in cart
  const items = await Promise.all(
    cartItems.map(async (item) => {
      const price = await this.getCurrentTicketPrice({ ticketId: item._id });
      return {
        ticketId: item._id,
        qty: item.qty,
        priceAcquired: price.price,
      };
    })
  );
  sale.customerName = customerName;
  sale.emailAddress = email;
  sale.refId = refID;
  sale.contactNumber = contactNumber;
  sale.cartItems = items;
  sale.status = "awaiting payment";
  sale.orderTotal = items.reduce((sum, item) => {
    return sum + item.qty * item.priceAcquired;
  }, 0);

  sale.salt = Math.round(new Date().valueOf() * Math.random()) + "";
  sale.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

    res.json(result);
  });
};

exports.processPayment = async (req, res) => {
  const { status, refid, option } = req.params;

  const sale = await Sale.findOne({ refId: refid }).exec();
  const pOption = await PaymentOption.findOne({ slug: option })
    .select("_id")
    .exec();

  sale.status = status;
  sale.paymentDetails = {
    option: await pOption._id,
    meta: {
      referenceNumber: refid,
      status: status,
    },
  };

  sale.save((err, result) => {
    res.redirect(
      `${process.env.WEBSITE_URL}/?payment=${status}&refid=${refid}`
    );
    
    //send Acknowledgement receipt
    if (status == "success") this.sendAR(result.refId);
  });

  //process accesspass
  if (status == "success") {
    this.generateAccessPass(sale, sale.cartItems);

    const accessPassPayload = {
      to: sale.emailAddress,
      from: process.env.EMAIL_ADDRESS,
      subject: "Your Star City Tickets are now available",
      html: `<a href="${process.env.WEBSITE_URL}/accesspass?s=${sale.salt}&r=${sale.refId}">Click here to view tickets</a>`,
    };

    try {
      const info = await sendMail(accessPassPayload);
      console.log(info);
    } catch (e) {
      console.log(e);
    }
  }
};

//TEST QRCODE
exports.styledQRcode = async (req, res) => {
  let options = { format: "A4" };

  let file = { content: artemplate() };
  // let file = {
  //   url: "https://starcity-website.herokuapp.com/accesspass?s=1042476560563&r=05d82401d3fa&t=W-SCAP-5830EA90",
  // };

  let buffer = await html_to_pdf.generatePdf(file, options);

  var mail = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ralphjularbal@gmail.com",
      pass: "elicci1234",
    },
  });

  const arPayload = {
    to: "ralphjularbal@yahoo.com",
    from: "noreply@starcity.com.ph",
    subject: "Thank you for your purchase",
    html: artemplate(),
    attachments: [
      {
        filename: "acknowledgement-receipt.pdf",
        content: buffer,
      },
    ],
  };

  try {
    let info = mail.sendMail(arPayload, function (error, info) {
      res.json({ message: info, error: error });
    });
  } catch (e) {
    res.json({ e });
  }
};

exports.generateAccessPass = (sale, accessPasses) => {
  accessPasses.map(async (ap) => {
    let isExisting = [];
    let finalToken = "";

    //get ticketDetails
    const ticket = await Ticket.findOne({
      _id: ap.ticketId,
    }).exec();

    for (let i = 0; i < ap.qty; i++) {
      //check for dupes
      do {
        finalToken = `W-${ticket.itemCode}-${crypto
          .randomBytes(4)
          .toString("hex")}`;

        isExisting = await AccessPass.find({
          accessToken: finalToken,
        }).exec();
      } while (isExisting.length !== 0);

      finalToken = finalToken.toUpperCase();
      let base64 = await QRCode.toDataURL(finalToken, {
        version: 4,
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 1,
        margin: 5,
        width: 300,
        height: 300,
      });
      const upload = await uploadBase64(
        await base64,
        `access-pass/${sale.customerName}/${sale.refId}/${finalToken}`
      );

      //save data to accesspassmodel
      let accessPass = new AccessPass();
      accessPass.ticketId = ap.ticketId;
      accessPass.salesId = sale._id;
      accessPass.accessToken = finalToken;
      accessPass.QRcode = await upload;

      accessPass.save(async (err, result) => {
        if (err) console.log("accesspass save failed in database");
        console.log("accesspass created");
      });
    }
  });
};

exports.sendAR = async (refId) => {
  const sale = await Sale.findOne({ refId: refId })
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name -_id",
      },
    })
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name -_id",
      },
    })
    .exec();
  console.log(sale);
  let options = { format: "A4" };
  let file = { content: artemplate(sale) };
  let buffer = await html_to_pdf.generatePdf(file, options);

  const details = {
    to: sale.emailAddress,
    from: process.env.EMAIL_ADDRESS,
    subject: "Your acknowledgement receipt for your Star City ticket purchase",
    html: `<h1>Greetings, ${sale.customerName}</h1>
        <p>Thank you for purchasing Star City tickets.</p>
      `,
    attachments: [
      {
        filename: "acknowledgement-receipt.pdf",
        content: buffer,
      },
    ],
  };

  try {
    let info = sendMail(details);
    console.log(info);
  } catch (e) {
    console.log(e);
  }
};
