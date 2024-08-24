// models/chat.js
const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user"); // Assuming you have a User model

const Chat = sequelize.define("Chat", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = Chat;
