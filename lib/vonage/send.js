const axios = require("axios");

exports.sendViaViber = async (req, res) => {
  const { recipient, imageURL } = req.body;
  const key = `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`;
  let buff = Buffer.from(key).toString("base64");

  await axios({
    method: "POST",
    url: `https://messages-sandbox.nexmo.com/v0.1/messages`,
    data: {
      from: { type: "viber_service_msg", id: "16273" },
      to: { type: "viber_service_msg", number: "639178657533" },
      message: {
        content: {
          type: "text",
          text: "Here is your Star City Ticket",
        },
      },
    },
    headers: { Authorization: `Basic ${buff}` },
  });

  const r = await axios({
    method: "POST",
    url: `https://messages-sandbox.nexmo.com/v0.1/messages`,
    data: {
      from: { type: "viber_service_msg", id: "16273" },
      to: { type: "viber_service_msg", number: "639178657533" },
      message: {
        content: {
          type: "image",
          image: {
            url: "https://starcitywebsite.s3.ap-southeast-1.amazonaws.com/access-pass/Ralph%20Jularbal/E4EB488DDB3F/W-RAYC-37D87B9E",
          },
        },
      },
    },
    headers: { Authorization: `Basic ${buff}` },
  });

  res.json(r.data);
};

exports.sendViaMessenger = async (req, res) => {
  const key = `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`;
  let buff = Buffer.from(key).toString("base64");

  const r = await axios({
    method: "POST",
    url: `https://messages-sandbox.nexmo.com/v0.1/messages`,
    data: {
      from: { type: "messenger", id: "107083064136738" },
      to: { type: "messenger", id: "4470492759703037" },
      message: {
        content: {
          type: "image",
          image: {
            url: "https://starcitywebsite.s3.ap-southeast-1.amazonaws.com/access-pass/Ralph%20Jularbal/E4EB488DDB3F/W-RAYC-37D87B9E",
          },
        },
      },
    },
    headers: { Authorization: `Basic ${buff}` },
  });

  console.log(r.data);
  res.json(r.data);
};
