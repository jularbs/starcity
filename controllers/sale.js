const Sale = require("../models/sale");
const Ticket = require("../models/ticket");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { uploadBase64 } = require("../helpers/s3uploader");

exports.getCurrentTicketPrice = (ticket) => {
  return new Promise((resolve, reject) => {
    const { ticketId } = ticket;
    Ticket.findOne({ _id: ticketId }).exec((err, result) => {
      if (err) reject(err);
      return resolve({ price: result.price });
    });
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
    .select("customerName cartItems orderTotal paymentDetails refId created_at -_id")
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

  // check if there is duplicate

  // if there is create again (LOOP)

  //get cartitems and compute for total

  //save sale
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
