// MODULES IMPORT
const bodyparser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const config = process.env;
const PORT = Number(config.DB_PORT)

app.use(
  cors({
    origin: '*'
  })
);

mongoose.set("strictQuery", true);
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json({ limit: "100mb" }));

// ROUTES IMPORT
app.get("/", (req, res) => {
  res.send("Code is deployed.");
});

const employeeRoute = require("./app/routes/Employee-Route");
app.use("/api/employee", employeeRoute);

const authRoute = require("./app/routes/Auth-Route");
app.use("/api/auth", authRoute);

// DB CONNECTION
const dbURL = require("./db-properties").DB_URL;
mongoose.connect(dbURL);
mongoose.connection.on("connected", () => {
  app.listen(process.env.PORT || PORT, () => {
    console.log(`app running on port ${process.env.PORT || PORT}`);
  });  
});
