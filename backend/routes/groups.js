let express = require("express");
let router = express.Router();
let groupController = require("../controllers/groups");
let authenticate = require("../middleware/auth");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

// let upload = require("../controllers/groups");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    },
  }),
});

router.get("/", authenticate.authenticate, groupController.getGroups);

router.post("/", authenticate.authenticate, groupController.postGroup);

router.get(
  "/:groupId/chats",
  authenticate.authenticate,
  groupController.getChatsForGroup
);

router.post(
  "/:groupId/files",
  authenticate.authenticate,
  upload.single("file"),
  groupController.uploadFile
);

router.post(
  "/:groupId/adduser",
  authenticate.authenticate,
  groupController.addUserToGroup
);

router.post(
  "/:groupId/makeadmin",
  authenticate.authenticate,
  groupController.makeUserAdmin
);

router.post(
  "/:groupId/removeuser",
  authenticate.authenticate,
  groupController.removeUserFromGroup
);

router.get(
  "/:groupId/details",
  authenticate.authenticate,
  groupController.getGroupDetails
);

module.exports = router;
