const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Group = sequelize.define("Group", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  groupname: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Group;
