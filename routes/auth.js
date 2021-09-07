const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // User Schema
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "adshcbhabcsdahcbhsda";

// ROUTE 1 : Create A User using: POST "/api/auth/createuser". Doesn't Require Login
router.post(
  "/createuser",

  [
    // Validation - Body
    body("name")
      .isLength({ min: 3 })
      .withMessage("The Name Should Be Atleast 3 characters"),
    body("email").isEmail().withMessage("Enter A Valid Email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("The Password Should Be Atleast 8 characters"),
  ],

  async (req, res) => {
    // If Error in Validation, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Try Catch Block
    try {
      // Check Whether the user with this email exists already
      const { name, email, password } = req.body;

      let user = await User.findOne({ email: email });

      // If User Exists
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" }); // Send Bad Request
      }

      // If User Doesn't Exist
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      user = await User.create({
        name: name,
        email: email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 2 : Login A User using: POST "/api/auth/login". Doesn't Require Login
router.post(
  "/login",

  [
    // Validation - Body
    body("email").isEmail().withMessage("Enter A Valid Email"),
    body("password").exists().withMessage("Password cannot be blank."),
  ],

  async (req, res) => {
    // If Error in Validation, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    // Try Catch Block
    try {
      let user = await User.findOne({ email });

      // If User Doesn't Exists
      if (!user) {
        return res.status(400).json({ error: "Wrong Credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Wrong Credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 3 : Get loggedIn User Details Using authtoken: POST "/api/auth/getuser". Require Login
router.post("/getuser", fetchuser, async (req, res) => {
  // Try Catch Block
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ error: "No User Found" }); // Send Bad Request
    }

    res.json(user);
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

module.exports = router;
