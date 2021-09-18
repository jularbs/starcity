const fs = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_PUBLICKEY,
  secretAccessKey: process.env.AWS_S3_SECRETKEY,
});

exports.uploadBase64 = (base64, folder) => {
  return new Promise((resolve, reject) => {
    const base64Data = new Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = base64.split(";")[0].split("/")[1];
    const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);

    s3.upload(
      {
        Bucket: process.env.AWS_S3_BUCKETNAME,
        Key: `${folder}/${image_name}.${type}`, // type is not required
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64", // required
        ContentType: `image/${type}`, // required. Notice the back ticks
      },
      (err, data) => {
        if (err) return reject(err);
        return resolve({
          location: data.Location,
          bucket: data.Bucket,
          key: data.Key,
        });
      }
    );
  });
};

exports.uploadTos3withKey = (file, folder) => {
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Key: `${folder}/${file.name}`,
        Bucket: process.env.AWS_S3_BUCKETNAME,
        Body: fs.readFileSync(file.path),
        ACL: "public-read",
      },
      (err, data) => {
        if (err) return reject(err);
        return resolve({
          location: data.Location,
          bucket: data.Bucket,
          key: data.Key,
        });
      }
    );
  });
};

exports.asyncUploadToS3WithKey = async (file, folder) => {
  return this.uploadTos3withKey(file, folder);
};

exports.uploadAllFilesToS3 = async (files, folder) => {
  return Promise.all(
    files.map((file) => this.asyncUploadToS3WithKey(file, folder))
  );
};

exports.deleteObjectFromS3 = async (key, bucket) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const res = await new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) =>
      err == null ? resolve(data) : reject(err)
    );
  });

  return res;
};
