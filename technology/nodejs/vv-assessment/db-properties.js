require("dotenv").config();
const config = process.env;

module.exports = {
  DB_PORT: Number(config.DB_PORT),
  DB_URL: config.DB_URL,
};