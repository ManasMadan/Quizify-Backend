const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Questions = require("../models/Questions"); // Questions Schema
const Submissions = require("../models/Submissions"); // Submissions Schema
const Quizcode = require("../models/QuizCode"); // Quizcode Schema
const fetchuser = require("../middleware/fetchuser");
const fetchquizcode = require("../middleware/fetchquizcode");

// ROUTE 1 : Fetch All Questions Using GET "/api/questions/fetchallquestions/:quizcode". Require Login
router.get(
  "/fetchallquestions/:quizcode",
  fetchuser,
  fetchquizcode,
  async (req, res) => {
    try {
      const questions = await Questions.find({
        quizcode: req.params.quizcode,
      }).select("-correctAnswers -user");
      res.json(questions);
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 2 : Fetch All Questions With Correct Answers Using POST "/api/questions/fetchallquestionanswers/:quizcode". Require Login
router.post(
  "/fetchallquestionanswers/:quizcode",
  fetchuser,
  async (req, res) => {
    try {
      const submission = Submissions.findOne({ user: req.user.id });
      const quizcode = Quizcode.findOne({ quizcode: req.params.quizcode });
      if (!submission && quizcode.user !== req.user.id) {
        return res.status(400).json({ error: "Submit To Continue" });
      }
      const questions = await Questions.find({
        quizcode: req.params.quizcode,
      }).select("-user");
      res.json(questions);
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 3 : Create Question Using POST "/api/questions/addquestion". Require Login
router.post(
  "/addquestion",
  fetchuser,
  fetchquizcode,
  [
    // Validation - Body
    body("questionType").isString().withMessage("Not A Valid Question Type"),
    body("questionStatement")
      .isString()
      .withMessage("Not A Valid Question Statement"),

    body("questionMarks")
      .isNumeric()
      .withMessage("Question Marks Must Be A Number"),
  ],
  async (req, res) => {
    try {
      // If Error in Validation, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        questionType,
        questionStatement,
        questionOptions,
        questionMarks,
        correctAnswers,
      } = req.body;
      const quizcode = req.quizcode;
      let question;

      if (questionOptions === []) {
        question = new Questions({
          questionType,
          questionStatement,
          questionMarks,
          quizcode,
          correctAnswers,
          user: req.user.id,
        });
      } else {
        question = new Questions({
          questionType,
          questionStatement,
          questionOptions,
          questionMarks,
          quizcode,
          correctAnswers,
          user: req.user.id,
        });
      }

      const saveQuestion = await question.save();
      res.json(saveQuestion);
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 4 : Update Question Using PUT "/api/question/updatequestion/:id". Require Login
router.put(
  "/updatequestion/:id",
  fetchuser,
  fetchquizcode,
  [
    // Validation - Body
    body("questionType").isString().withMessage("Not A Valid Question Type"),
    body("questionStatement")
      .isString()
      .withMessage("Not A Valid Question Statement"),

    body("questionMarks")
      .isNumeric()
      .withMessage("Question Marks Must Be A Number"),
  ],
  async (req, res) => {
    try {
      // If Error in Validation, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let question = await Questions.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Not Found" });
      }

      if (question.user.toString() !== req.user.id) {
        return res.status(401).json({ error: "Not Allowed" });
      }

      const {
        questionType,
        questionStatement,
        questionOptions,
        questionMarks,
        correctAnswers,
      } = req.body;
      const newQuestion = {
        questionType,
        questionStatement,
        questionMarks,
        correctAnswers,
      };
      if (questionOptions) {
        newQuestion.questionOptions = questionOptions;
      }

      question = await Questions.findByIdAndUpdate(
        req.params.id,
        { $set: newQuestion },
        { new: true }
      );

      const saveQuestion = await question.save();
      res.json(saveQuestion);
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 5 : Delete Question Using DELETE "/api/question/delete/:id". Require Login
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    let question = await Questions.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Not Found" });
    }

    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not Allowed" });
    }

    question = await Questions.findByIdAndDelete(req.params.id);

    res.json({ Sucess: "Question has been deleted", question });
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    console.error(error);
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

module.exports = router;
