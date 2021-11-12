const { getObjectFromS3 } = require("../helpers/s3uploader");

exports.getMedia = async (req, res) => {
  const { key, bucket } = req.query;

  const data = await getObjectFromS3(key, bucket).catch((err) =>
    res.json({ error: err })
  );

  res.setHeader("Content-Type", data.ContentType);
  res.send(data.Body);
};
