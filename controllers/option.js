const slugify = require("slugify");
const Option = require("../models/option");
const { createEntry } = require("../controllers/auditTrail");
const { uploadFile } = require("../helpers/s3uploader");
const formidable = require("formidable");

exports.logoUpload = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { value } = files;
    const { name } = fields;

    let imageInfo;
    try {
      imageInfo = await uploadFile(value, `logo-image`);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: "Error on uploading image to Amazon S3" });
    }

    let option = await Option.findOne({ name }).exec();

    if (option) {
      try {
        option.name = name;
        option.value = imageInfo.location;
        option.meta = imageInfo;
        const result = await option.save();
        res.json({ result, status: "success" });
        createEntry(
          req.profile.name,
          `Option ${name} updated`,
          imageInfo,
          req
        );
      } catch (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }

    } else {
      try {
        const slug = slugify(name).toLowerCase();
        let newOption = new Option();

        newOption.name = name;
        newOption.slug = slug;
        newOption.value = value;

        const result = await newOption.save();
        res.json(result);
        createEntry(
          req.profile.name,
          `Option ${name} created`,
          {
            value: imageInfo.location,
          },
          req
        );
      } catch (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
    }
  });
};

exports.create = async (req, res) => {
  const { name, value, meta } = req.body;
  console.log("Req: ", req.body);
  let option = await Option.findOne({ name }).exec();

  if (option) {
    try {
      option.name = name;
      option.value = value;
      option.meta = meta;
      const result = await option.save();
      createEntry(
        req.profile.name,
        `Option ${name} updated`,
        { value: req.value },
        req
      );
      return res.json({ result, success: "Option has been updated successfully!" });
    } catch (err) {
      return res.status(400).json({
        error: "Unable to save option. Please try again later.",
        message: err,
      });
    }
  } else {
    try {
      const slug = slugify(name).toLowerCase();

      let newOption = new Option();

      newOption.name = name;
      newOption.slug = slug;
      newOption.value = value;
      newOption.meta = meta;

      const result = await newOption.save();
      createEntry(
        req.profile.name,
        `Option ${name} created`,
        {
          value: req.value,
        },
        req
      );
      return res.json({ result, success: "Option has been updated successfully!" });
    } catch (err) {
      return res.status(400).json({
        error: "Unable to save option. Please try again later.",
        message: err,
      });
    }
  }
};

exports.read = async (req, res) => {
  try {
    const data = await Option.findOne({ name: req.params.name })
      .select("name value")
      .exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.list = async (req, res) => {
  try {
    const options = await Option.find()
      .select("name value")
      .exec();
    res.json(options);
  } catch (err) {
    res.status(400).json({ error: "Unable to retrieve options" });
  }
};

exports.listOptionsv2 = async (req, res) => {
  try {
    const result = await Option.find({})
      .select("name value")
      .exec();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: "Unable to retrieve options" });
  }
};

exports.update = async (req, res) => {
  const { slug, name, value, meta } = req.body;

  const option = await Option.findOne({ slug: slug }).exec();

  option.name = name;
  option.value = value;
  option.meta = meta;

  try {
    const result = await option.save();
    return res.json({ result, status: "success" });
  } catch (err) {
    return res.status(400).json({
      error: "Unable to update option. Please try again later.",
      message: err,
    });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: "Option slug is required",
    });
  }

  try {
    await Option.findOneAndDelete({ slug }).exec();
    res.json({ success: "Payment Option deleted successfully" });
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }

};
