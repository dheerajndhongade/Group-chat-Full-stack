let express = require("express");

let router = express.Router();
let chatController = require("../controllers/chats");
let authenticate = require("../middleware/auth");

router.get("/chats", authenticate.authenticate, chatController.getChats);

router.post("/chats", authenticate.authenticate, chatController.postChat);

module.exports = router;
