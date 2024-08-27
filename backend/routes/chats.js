let express = require("express");

let router = express.Router();
let chatController = require("../controllers/chats");
let authenticate = require("../middleware/auth");

router.post(
  "/groups/:groupId/chats",
  authenticate.authenticate,
  chatController.postChat
);

module.exports = router;
