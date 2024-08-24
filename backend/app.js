const express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");
let chatRoute = require("./routes/chats");

let User = require("./models/user");
let Chat = require("./models/chat");

let app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);
app.use(bodyParser.json());
app.use(userRoute);
app.use(chatRoute);

User.hasMany(Chat, { foreignKey: "userId" });
Chat.belongsTo(User, { foreignKey: "userId" });

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
