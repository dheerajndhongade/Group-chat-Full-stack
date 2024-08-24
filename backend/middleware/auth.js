let jwt = require("jsonwebtoken");
let User = require("../models/user");
require("dotenv").config();

let jwtSecretKey = process.env.JWT_SECRET;

exports.authenticate = async (req, res, next) => {
  let token = req.header("Authorization");

  try {
    const decoded = jwt.verify(token, jwtSecretKey);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};
