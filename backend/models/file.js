const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const File = sequelize.define("File", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  uploadedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = File;
