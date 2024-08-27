const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Group = require("../models/group");
require("dotenv").config();

let jwtSecretKey = process.env.JWT_SECRET;
exports.createUser = (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let phno = req.body.phno;

  User.findOne({ where: { email } })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      return User.create({
        username: name,
        email: email,
        phno: phno,
        password: hashedPassword,
      });
    })
    .then(() => {
      console.log("User created");
      res.status(201).json({
        message: "User created successfully",
      });
    })
    .catch((err) => {
      console.error("Error creating user:", err);
      res
        .status(500)
        .json({ message: "An error occurred while creating the user" });
    });
};
exports.loginUser = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
      }
      return bcrypt.compare(password, user.password).then((isValidPassword) => {
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        let token = jwt.sign({ userId: user.id }, jwtSecretKey);
        res.status(200).json({
          token,
          username: user.username,
          message: "Login successful",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error during login" });
    });
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email"],
    });
    res.status(200).json({ users, message: "Fetched all users" });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};

exports.searchUsers = async (req, res) => {
  const query = req.query.query;
  const groupId = req.query.groupId; // Group ID passed as a query parameter

  try {
    // Find the group with the associated members
    const group = await Group.findByPk(groupId, {
      include: {
        model: User,
        as: "Members",
        attributes: ["id"], // We only need the user IDs of existing members
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Extract user IDs of the existing group members
    const existingUserIds = group.Members.map((member) => member.id);

    // Search for users matching the query who are NOT in the group
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { username: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
              { phno: { [Op.like]: `%${query}%` } },
            ],
          },
          {
            id: { [Op.notIn]: existingUserIds },
          },
        ],
      },
      attributes: ["id", "username", "email", "phno"],
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
