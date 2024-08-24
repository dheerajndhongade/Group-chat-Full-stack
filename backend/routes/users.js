let express = require("express");

let router = express.Router();
let userController = require("../controllers/user");
let authenticate = require("../middleware/auth");

router.post("/user/signup", userController.createUser);

router.post("/user/login", userController.loginUser);

router.get("/users", userController.getUsers);

module.exports = router;
