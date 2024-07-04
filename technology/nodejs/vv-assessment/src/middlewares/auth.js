const jwt = require("jsonwebtoken");
require("dotenv").config();
const config = process.env;

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.send({ status: 403, message: 'A token is required for authentication' })
  }

  try {
    const tokenArr = token.split(" ");
    token = tokenArr[1];
    const decoded = jwt.verify(token, config.SECRET_KEY, (err, res) => {
      if (err) {
        return res.send({ status: 403, message: 'token expired' })

      }
      return res;
    });

    if (decoded == 'token expired') {
      return res.send({ status: 401, message: 'Token has been expired login again !' })
    }

    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;