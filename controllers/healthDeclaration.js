const HealthDeclaration = require("../models/healthDeclaration");
const { uploadBase64 } = require("../helpers/s3uploader");

exports.create = async (req, res) => {
  const { signatureURL, fullName } = req.body;
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  //   const image = await uploadBase64(
  //     signatureURL,
  //     `signatures/${year}/${month}/${fullName}/${Math.floor(
  //       Math.random() * 100000 + 1
  //     )}`
  //   );

  console.log(req.body);
};
