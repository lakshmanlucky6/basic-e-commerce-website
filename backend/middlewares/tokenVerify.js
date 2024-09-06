const jwt = require("jsonwebtoken");
require('dotenv').config()

const tokenVerify = (req, res, next) => {
  const bearerToken = req.headers.authorization;
  if (bearerToken === undefined) {
    return res.send({ message: "Unauthorised access" });
  }
  const token = bearerToken.split(" ")[1];
  try {
    let decode = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (err) {
    res.send({ message: "token expired. Plz relogin to continue" });
  }
};

module.exports = tokenVerify;
