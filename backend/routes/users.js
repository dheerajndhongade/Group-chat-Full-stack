let express = require("express");

let router = express.Router();
let userController = require("../controllers/user");
let authenticate = require("../middleware/auth");

router.post("/signup", userController.createUser);

router.post("/login", userController.loginUser);

module.exports = router;
