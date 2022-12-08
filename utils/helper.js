let response = require("./response.manager");
let jwt = require("jsonwebtoken");

exports.generateAccessToken = async (userData) => {
  return jwt.sign(userData, "abcdefghijklmnopqrstuvwxyz", {});
};

exports.authenticateToken = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token,"abcdefghijklmnopqrstuvwxyz", (err, auth) => {
      if (err) {
        return response.unauthorisedRequest(res);
      } else {
        req.token = auth;
      }
    });
    next();
  } else {
    return response.unauthorisedRequest(res);
  }
};
