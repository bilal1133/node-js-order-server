const multer = require("multer");
const AWS = require("aws-sdk");
const Jimp = require("jimp");

const uploadImage = (image) => {
  return new Promise(async (res, reg) => {
    try {
      const file = await Jimp.read(Buffer.from(image.buffer, "base64"))
        .then(async (image) => {
          // const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
          image.resize(Jimp.AUTO, 900);
          // image.print(font, 1000, 700, "Logo");
          return image.getBufferAsync(Jimp.AUTO);
        })
        .catch((err) => {
          reg({ msg: "Server Error", error: err });
        });

      const s3FileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      let s3bucket = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
        region: process.env.AWS_REGION,
      });

      //Where you want to store your file
      const name = `${new Date().getTime()}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: name,
        Body: file,
        ContentType: image.mimetype,
        ACL: "public-read",
      };

      s3bucket.upload(params, async (err, data) => {
        try {
          if (err) {
            reg({ error: true, Message: err });
          } else {
            const newFileUploaded = {
              fileLink: s3FileURL + name,
              s3_key: params.Key,
            };
            const info = { photo: newFileUploaded.fileLink };
            // Add all info to database after store picture to S3
            console.log("-==-=-=-=-=-=>", info);
            res(info.photo);
          }
        } catch (err) {
          console.log(err);
          reg({ msg: "Server Error", error: err });
        }
      });
    } catch (err) {
      console.log(err);
      reg({ msg: "Server Error", error: err });
    }
  });
};

module.exports = uploadImage;
