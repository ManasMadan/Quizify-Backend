const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const fetchuser = (req, res, next) => {
  // Get User from JWT_TOKEN and add id to req object
  const token = req.header("auth-token");
  let JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    JWT_SECRET = process.env.JWT_SECRET;
  } else {
    JWT_SECRET = "sssh";
  }

  // If token Not Valid
  if (!token) {
    res.status(401).send({ error: "Enter A Valid Token" }); // Send Bad Response
  }

  // Try Catch Block To Verify Token
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next(); // Run Next Function
  } catch (error) {
    res.status(401).send({ error: "Enter A Valid Token" });
  }
};

module.exports = fetchuser;
