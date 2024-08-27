const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");
const Group = require("./group");

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
  groupId: {
    type: Sequelize.UUID,
    references: {
      model: Group,
      key: "id",
    },
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
});

module.exports = Chat;
