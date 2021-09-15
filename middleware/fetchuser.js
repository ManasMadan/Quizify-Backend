const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const fetchuser = (req, res, next) => {
  // Get User from JWT_TOKEN and add id to req object
  const token = req.header("auth-token");

  // If token Not Valid
  if (!token) {
    res.status(401).send({ error: "Enter A Valid Token" }); // Send Bad Response
  }

  // Try Catch Block To Verify Token
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next(); // Run Next Function
  } catch (error) {
    res.status(401).send({ error: "Enter A Valid Token" });
  }
};

module.exports = fetchuser;
