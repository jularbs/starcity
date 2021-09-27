const Sale = require("../models/sale");
const Ticket = require("../models/ticket");
const PaymentOption = require("../models/paymentOption");
const AccessPass = require("../models/accessPass");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { uploadBase64, uploadBufferPNG } = require("../helpers/s3uploader");
const mongoose = require("mongoose");

const { sendMail } = require("../helpers/nodemailer");
const { toDataURL } = require("qrcode-styled");

//qrcodestyling node
const {
  QRCodeStyling,
} = require("qr-code-styling-node/lib/qr-code-styling.common.js");
const nodeCanvas = require("canvas");

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
    refID = crypto.randomBytes(6).toString("hex");
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
    option: pOption._id,
    meta: {
      referenceNumber: refid,
      status: status,
    },
  };

  sale.save((err, result) => {
    res.redirect(
      `${process.env.WEBSITE_URL}/?payment=${status}&refid=${refid}`
    );
  });

  //process accesspass

  if (status == "success") {
    //send Acknowledgement receipt
    const details = {
      to: sale.emailAddress,
      from: process.env.EMAIL_ADDRESS,
      subject:
        "Your acknowledgement receipt for your Star City ticket purchase",
      html: `send details`,
    };

    try {
      let info = sendMail(details);
      console.log(info);
    } catch (e) {
      console.log(e);
    }

    //get items
    const accessPasses = sale.cartItems;

    accessPasses.map(async (ap) => {
      //create token
      let isExisting = [];
      let finalToken = "";

      //get ticketDetails
      const ticket = await Ticket.findOne({
        _id: ap.ticketId,
      }).exec();

      //repeat based on number of tickets
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

        const options = {
          width: 300,
          height: 300,
          data: finalToken,
          // data: data.accessToken,
          margin: 10,
          qrOptions: {
            typeNumber: "4",
            mode: "Byte",
            errorCorrectionLevel: "H",
          },
          imageOptions: {
            hideBackgroundDots: false,
            imageSize: 0.5,
            margin: 0,
          },
          dotsOptions: {
            type: "classy-rounded",
            gradient: {
              type: "linear",
              rotation: 0,
              colorStops: [
                {
                  offset: 0,
                  color: "#ffbd24",
                },
                {
                  offset: 1,
                  color: "#ffdc33",
                },
              ],
            },
          },
          backgroundOptions: {
            color: "#ffffff",
          },
          image: `data/img/spc_logo.png`,
          dotsOptionsHelper: {
            colorType: {
              single: true,
              gradient: false,
            },
            gradient: {
              linear: true,
              radial: false,
              color1: "#6a1a4c",
              color2: "#6a1a4c",
              rotation: "0",
            },
          },
          cornersSquareOptions: {
            type: "dot",
            color: "#ffbd24",
            gradient: null,
          },
          cornersSquareOptionsHelper: {
            colorType: {
              single: true,
              gradient: false,
            },
            gradient: {
              linear: true,
              radial: false,
              color1: "#000000",
              color2: "#000000",
              rotation: "0",
            },
          },
          cornersDotOptions: {
            type: "",
            color: "#ffbd24",
          },
          cornersDotOptionsHelper: {
            colorType: {
              single: true,
              gradient: false,
            },
            gradient: {
              linear: true,
              radial: false,
              color1: "#000000",
              color2: "#000000",
              rotation: "0",
            },
          },
          backgroundOptionsHelper: {
            colorType: {
              single: true,
              gradient: false,
            },
            gradient: {
              linear: true,
              radial: false,
              color1: "#ffffff",
              color2: "#ffffff",
              rotation: "0",
            },
          },
        };

        const qrCodeImage = new QRCodeStyling({
          nodeCanvas, // this is required
          ...options,
        });

        const buffer = await qrCodeImage.getRawData("png");
        const upload = await uploadBufferPNG(
          buffer,
          `access-pass/${sale.customerName}/${sale.refId}/${finalToken}`
        );

        //save data to accesspassmodel
        let accessPass = new AccessPass();
        accessPass.ticketId = ap.ticketId;
        accessPass.salesId = sale._id;
        accessPass.accessToken = finalToken;
        accessPass.QRcode = await upload;

        accessPass.save((err, result) => {
          if (err) console.log("accesspass save failed in database");

          console.log("accesspass created");
          //email customer to say that their access passes are ready to be shipped
        });
      }
    });

    //SEND tickets
    const accessPassPayload = {
      to: sale.emailAddress,
      from: process.env.EMAIL_ADDRESS,
      subject: "Your Star City Tickets are now available",
      html: `<a href="${process.env.WEBSITE_URL}/accesspass?s=${sale.salt}&r=${sale.refId}">Click here to view tickets</a>`,
    };

    try {
      let info = sendMail(accessPassPayload);
      console.log(info);
    } catch (e) {
      console.log(e);
    }
  }
};

//TEST QRCODE
exports.styledQRcode = async (req, res) => {
  const options = {
    width: 500,
    height: 500,
    data: "asdfasfasdfasdfafdasdfasfasf",
    // data: data.accessToken,
    margin: 10,
    qrOptions: {
      typeNumber: "4",
      mode: "Byte",
      errorCorrectionLevel: "H",
    },
    imageOptions: {
      hideBackgroundDots: false,
      imageSize: 0.5,
      margin: 0,
    },
    dotsOptions: {
      type: "classy-rounded",
      gradient: {
        type: "linear",
        rotation: 0,
        colorStops: [
          {
            offset: 0,
            color: "#ffbd24",
          },
          {
            offset: 1,
            color: "#ffdc33",
          },
        ],
      },
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    image: `data/img/spc_logo.png`,
    dotsOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#6a1a4c",
        color2: "#6a1a4c",
        rotation: "0",
      },
    },
    cornersSquareOptions: {
      type: "dot",
      color: "#ffbd24",
      gradient: null,
    },
    cornersSquareOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    cornersDotOptions: {
      type: "",
      color: "#ffbd24",
    },
    cornersDotOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#000000",
        color2: "#000000",
        rotation: "0",
      },
    },
    backgroundOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
      gradient: {
        linear: true,
        radial: false,
        color1: "#ffffff",
        color2: "#ffffff",
        rotation: "0",
      },
    },
  };

  const qrCodeImage = new QRCodeStyling({
    nodeCanvas, // this is required
    ...options,
  });

  qrCodeImage.getRawData("png").then(async (buffer) => {
    const loc = await uploadBufferPNG(buffer, "test/qrs");

    res.send(loc);
  });
};
