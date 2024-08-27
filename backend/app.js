const express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");
let chatRoute = require("./routes/chats");
let groupRoute = require("./routes/groups");

let User = require("./models/user");
let Chat = require("./models/chat");
let Group = require("./models/group");
let File = require("./models/file");
//let GroupAdmins = require("./models/groupadmins");

let app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);
app.use(bodyParser.json());
app.use(userRoute);
app.use("/groups", groupRoute);
app.use(chatRoute);

Group.hasMany(Chat, { foreignKey: "groupId" });
Chat.belongsTo(Group, { foreignKey: "groupId" });

Group.belongsToMany(User, {
  through: "UserGroups",
  as: "Members",
  foreignKey: "groupId",
});
User.belongsToMany(Group, {
  through: "UserGroups",
  as: "MemberGroups",
  foreignKey: "userId",
});

Group.belongsToMany(User, {
  through: "GroupAdmins",
  as: "Admins",
  foreignKey: "groupId",
});
User.belongsToMany(Group, {
  through: "GroupAdmins",
  as: "AdminGroups",
  foreignKey: "userId",
});

Chat.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Chat, { foreignKey: "userId" });

Chat.hasMany(File, { foreignKey: "chatId" });
File.belongsTo(Chat, { foreignKey: "chatId" });

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
