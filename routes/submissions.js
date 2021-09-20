const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Submissions = require("../models/Submissions"); // Submissions Schema
const SubmittedBy = require("../models/SubmittedBy"); // Schema
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
    body("name").exists().withMessage("Body Incomplete - Name"),
    body("email").isEmail().withMessage("Enter A Valid Email"),
    body("totalMarks").isNumeric().withMessage("Enter Total Marks"),
  ],

  async (req, res) => {
    // If Error in Validation, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Try Catch Block
    try {
      if (req.quizcodeDeleted) {
        res.status(400).json({ error: "Quizcode has been deleted" });
      }

      const submitted = await SubmittedBy.findOne({ user: req.user.id });
      if (!submitted) {
        return res.status(400).json({ error: "Submit To Continue" });
      }

      const { answers, email, name, totalMarks, marksAwarded } = req.body;
      const quizcode = req.quizcode;

      let submission = await Submissions.findOne({ quizcode });

      if (submission) {
        return res.status(400).json({ error: "You Have Already Submitted" });
      }

      submission = await Submissions.create({
        user: req.user.id,
        name,
        quizcode,
        answers,
        marksAwarded,
        totalMarks,
        email,
      });

      res.json({ submission });
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 2 : Get All Submissions of a user: GET "/api/submissions/getallsubmissions". Require Login
router.get("/getallsubmissions", fetchuser, async (req, res) => {
  try {
    const mysubmissions = await Submissions.find({
      user: req.user.id,
    });
    res.json(mysubmissions);
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    console.error(error);
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

// ROUTE 3 : Get All Submissions of a quizcode: GET "/api/submissions/quizcodesubmissions/:quizcode". Require Login
router.get(
  "/quizcodesubmissions/:quizcode",
  fetchuser,
  fetchquizcode,
  async (req, res) => {
    try {
      if (!req.quizcodeDeleted) {
        const mysubmissions = await Submissions.find({
          quizcode: req.quizcode,
        });
        res.json(mysubmissions);
      }
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

module.exports = router;
