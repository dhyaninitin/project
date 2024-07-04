// MODULES IMPORT
const bodyparser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();
const config = process.env;
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME || 'BrainStorm';
const DB_URL = process.env.DB_URL;

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

// const employeeRoute = require("./app/routes/Employee-Route");
// app.use("/api/employee", employeeRoute);

const authRoute = require("./src/routes/auth.route");
const examRouter = require("./src/routes/examination.route");
app.use("/api/auth", authRoute);
app.use("/api/exam", examRouter);

// DB CONNECTION
mongoose.connect(`${DB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
  });
});