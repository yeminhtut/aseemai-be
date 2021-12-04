'use strict';

const aws = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const config = require('../../config/db');
const s3 = new aws.S3({
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
});

const tmpStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/')
  },
  filename: function(req, file, cb) {
    let extFile = file.originalname.split(".").pop();
    let fileName = file.originalname.split(".").shift() + '-' + Date.now();
    fileName = fileName + "." + extFile;
    cb(null, fileName);
  }
})
const tmpFileUpload = multer({ storage: tmpStorage })

const uploadFileToS3Bucket = multer({
  fileFilter: function(req, file, cb) {
    let filetypes = /jpeg|jpg|png|svg/;
    let mimetype = filetypes.test(file.mimetype);
    let extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      'Error: File upload only supports the following filetypes - ' + filetypes,
    );
  },
  storage: multerS3({
    s3: s3,
    bucket: 'facilityapp',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb) {
      let fileName = file.originalname;
      let dirName;
      let profileRegex = /\/users/;
      let categoryRegex = /\/categories/;
      let issueRegex = /\/issues/;
      if (profileRegex.test(req.originalUrl)) {
        dirName = 'api-upload/profile/';
      } else if (categoryRegex.test(req.originalUrl)) {
        dirName = 'api-upload/icon/';
      } else if (issueRegex.test(req.originalUrl)) {
        dirName = 'api-upload/issue/';
      } else {
        dirName = 'api-upload/other/';
      }
      cb(
        null,
        `${dirName}${Date.now()}${Math.floor(Math.random() * 1e8)}${fileName}`,
      );
    },
  }),
});

module.exports = {
  uploadFileToS3Bucket,
  tmpFileUpload
};
