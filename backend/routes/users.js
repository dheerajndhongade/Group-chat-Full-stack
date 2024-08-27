let express = require("express");
let router = express.Router();
let userController = require("../controllers/user");
let authenticate = require("../middleware/auth");

// User signup
router.post("/user/signup", userController.createUser);

// User login
router.post("/user/login", userController.loginUser);

// Get all users (consider adding authentication if this should be restricted)
router.get("/users", authenticate.authenticate, userController.getUsers);

// Search users by query (e.g., username, email, phone number)
router.get(
  "/users/search",
  authenticate.authenticate,
  userController.searchUsers
);

module.exports = router;
