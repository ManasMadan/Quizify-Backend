const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // User Schema
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
require("dotenv").config();
const htmlGenerator = require("./html_template").htmlGenerator;

let JWT_SECRET;
if (process.env.NODE_ENV === "production") {
  JWT_SECRET = process.env.JWT_SECRET;
} else {
  JWT_SECRET = "sssh";
}

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
        email: email.toLowerCase(),
        password: secPass,
        verified: false,
      });

      // Send Email
      // SMTP SETUP
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.AUTH_EMAIL_ID,
          pass: process.env.AUTH_EMAIL_PASSWORD,
        },
      });

      const link = `${process.env.APP_URL}/#/verify/${jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: "10m" }
      )}`;
      const mailOptions = {
        to: email.toLowerCase(),
        subject: "Please confirm your Email account",
        html: htmlGenerator(link),
      };

      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          return res.status(400).json(error);
        } else {
          return res.json({ success: "Email Verification Link Sent" });
        }
      });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 2 : Verify User Email: GET "/api/auth/verifyuser/userid". Doesn't Require Login
router.get("/verifyuser/:userid", async (req, res) => {
  // Try Catch Block
  try {
    const data = jwt.verify(req.params.userid, JWT_SECRET);

    const userId = data.id;
    let user = await User.findById(userId);

    // If User Does Not Exists
    if (!user || user.verified) {
      return res.status(400).json({ error: "Invalid Link" }); // Send Bad Request
    }

    user.verified = true;
    user = await User.findByIdAndUpdate(userId, {
      $set: user,
    });

    res.json({ success: "Email Verified Succesfully" });
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(400).json({ error: "Token Expired" });
    }
    // Catch Block For Any Error in MongoDB or above code
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

// ROUTE 3 : Login A User using: POST "/api/auth/login". Doesn't Require Login
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

    let { email, password } = req.body;
    // Try Catch Block
    try {
      email = email.toLowerCase();
      let user = await User.findOne({ email });

      // If User Doesn't Exists
      if (!user) {
        return res.status(400).json({ error: "Wrong Credentials" });
      }

      if (!user.verified) {
        return res.status(400).json({ error: "Verify Email To Continue" });
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

// ROUTE 4 : Get loggedIn User Details Using authtoken: POST "/api/auth/getuser". Require Login
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

// ROUTE 5 : Get User Details Using ID : GET "/api/auth/getuserdetailsid". Require Login
router.get("/getuserdetailsid/:userid", fetchuser, async (req, res) => {
  // Try Catch Block
  try {
    const userId = req.params.userid;

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

// ROUTE 6 : Send Verification Email : POST "/api/auth/sendverificationemail". No Login Required
router.post(
  "/sendverificationemail",
  [
    // Validation - Body
    body("email").isEmail().withMessage("Enter A Valid Email"),
  ],
  async (req, res) => {
    try {
      const { email } = req.body;

      let user = await User.findOne({ email: email });

      // If User Does Not Exists
      if (!user) {
        return res.status(400).json({ error: "No User Found" }); // Send Bad Request
      }
      // If User is already verified
      if (user.verified) {
        return res.status(400).json({ error: "User Already Verified" }); // Send Bad Request
      }

      // Send Email
      // SMTP SETUP
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.AUTH_EMAIL_ID,
          pass: process.env.AUTH_EMAIL_PASSWORD,
        },
      });

      const link = `${process.env.APP_URL}/#/verify/${jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: "10m" }
      )}`;
      const mailOptions = {
        to: email.toLowerCase(),
        subject: "Please confirm your Email account",
        html: htmlGenerator(link),
      };

      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          return res.status(400).json(error);
        } else {
          return res.json({ success: "Email Verification Link Sent" });
        }
      });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

module.exports = router;
