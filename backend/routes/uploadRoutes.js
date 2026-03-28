const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// NOTE: In modern S3, you might get an AccessDenied error if ACLs are disabled on the bucket.
// If that happens, you do not need 'acl: public-read' as long as the bucket policy allows public reads.
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME || 'fallback-bucket-name',
    // acl: 'public-read', // Uncomment if your bucket requires ACLs, but bucket policies are preferred.
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'materials/' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

router.post('/', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // multer-s3 attaches the S3 URL to req.file.location
  res.status(200).json({ fileUrl: req.file.location });
});

module.exports = router;
