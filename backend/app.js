const express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");
let port = 5000;

let sequelize = require("./util/database");
let userRoute = require("./routes/users");

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/user", userRoute);

sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`Running at port ${port}`);
    });
  })
  .catch((err) => console.log(err));
