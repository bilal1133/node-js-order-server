const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token)
    return res.status(401).send({
      field: { message: "Access denied. No token provided", name: "No token" },
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;

    next();
  } catch (ex) {
    res.status(401).send({
      field: { message: "Unauthorized Access", name: "Unauthorized" },
    });
  }
};
