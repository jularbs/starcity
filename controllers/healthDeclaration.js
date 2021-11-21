const HealthDeclaration = require("../models/healthDeclaration");
const { uploadBase64 } = require("../helpers/s3uploader");

exports.create = async (req, res) => {
  const {
    signatureURL,
    fullName,
    emailAddress,
    nationality,
    permanentAddress,
    currentAddress,
    sex,
    age,
    birthDate,
    companyName,
    recentTravel,
    questionAnswer,
    temperature,
    contactNumber,
    closeEnvironment,
  } = req.body;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  //VALIDATE
  if (signatureURL) {
    const signature = await uploadBase64(
      signatureURL,
      `signatures/${year}/${month}/${fullName}/${Math.floor(
        Math.random() * 100000 + 1
      )}`
    );

    const hd = new HealthDeclaration();
    hd.fullName = fullName;
    hd.emailAddress = emailAddress;
    hd.temperature = temperature;
    hd.contactNumber = contactNumber;
    hd.nationality = nationality;
    hd.permanentAddress = permanentAddress;
    hd.currentAddress = currentAddress;
    hd.sex = sex;
    hd.age = age;
    hd.birthDate = birthDate;
    hd.companyName = companyName;
    hd.recentTravel = recentTravel;
    hd.closeEnvironment = closeEnvironment;
    hd.questionAnswer = questionAnswer;
    hd.signature = signature;

    hd.save((err, result) => {
      if (err) {
        res
          .status(400)
          .json({
            error:
              "Something went wrong. Please make sure all required fields are filled.",
          });
      } else {
        res.json(result);
      }
    });
  } else {
    res.status(400).json({ error: "Signature required" });
  }
};

exports.list = async (req, res) => {
  const { skip, limit } = req.query;

  HealthDeclaration.find()
    .select("fullName contactNumber temperature companyName createdAt")
    .sort("-createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .exec(async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      const count = await HealthDeclaration.countDocuments();
      res.json({ data, count });
    });
};

exports.read = async (req, res) => {
  const { _id } = req.params;
  HealthDeclaration.findOne({ _id }).exec((err, result) => {
    res.json(result);
  });
};
