const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Submissions = require("../models/Submissions"); // Submissions Schema
const fetchuser = require("../middleware/fetchuser");
const fetchquizcode = require("../middleware/fetchquizcode");

// ROUTE 1 : Create A Submissions using: POST "/api/submissions/createsubmission". Require Login
router.post(
  "/createsubmission",
  fetchuser,
  fetchquizcode,
  [
    // Validation - Body
    body("answers").exists().withMessage("Body Incomplete - answers array"),
  ],

  async (req, res) => {
    // If Error in Validation, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Try Catch Block
    try {
      const { answers } = req.body;
      const quizcode = req.quizcode;

      let submission = await Submissions.findOne({ user: req.user.id });

      // If User Exists
      if (submission) {
        return res
          .status(400)
          .json({ error: "Sorry You Have Already Submitted" }); // Send Bad Request
      }

      // If Submission has not been made
      submission = await Submissions.create({
        user: req.user.id,
        quizcode,
        answers,
      });

      res.json({ submission });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

module.exports = router;
