const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const QuizCode = require("../models/QuizCode"); // QuizCode Schema
const Questions = require("../models/Questions"); // Questions Schema
const fetchuser = require("../middleware/fetchuser");

// ROUTE 1 : Check QuizCode Using GET "/api/quizcode/check/:quizcode". Require Login
router.get("/check/:quizcode", fetchuser, async (req, res) => {
  try {
    const quizcode = await QuizCode.findOne({ quizcode: req.params.quizcode });
    if (!quizcode) {
      return res.status(404).json({ error: "Not Found" });
    }

    res.json({ quizcode });
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    console.error(error);
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

// ROUTE 2 : Get all QuizCodes Using GET "/api/quizcode/getallquizcodes/". Require Login
router.get("/getallquizcodes", fetchuser, async (req, res) => {
  try {
    const quizcodes = await QuizCode.find({ user: req.user.id });
    res.json({ quizcodes });
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    console.error(error);
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

// ROUTE 3 : Create QuizCode Using POST "/api/quizcode/createquizcode". Require Login
router.post(
  "/createquizcode",
  fetchuser,
  [
    // Validation - Body
    body("quizcode")
      .isLength({ min: 5, max: 5 })
      .withMessage("The QuizCode Should Be 5 characters"),
  ],
  async (req, res) => {
    try {
      // If Error in Validation, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const quizCodeDataObject = await QuizCode.findOne({
        quizcode: req.body.quizcode,
      });
      if (quizCodeDataObject) {
        return res.status(400).json({ error: "Quiz Code Already Exists" });
      }
      const { quizcode } = req.body;
      const quizcodeData = new QuizCode({
        quizcode,
        user: req.user.id,
      });

      const saveQuizCode = await quizcodeData.save();
      res.json(saveQuizCode);
    } catch (error) {
      // Catch Block For Any Error in MongoDB or above code
      console.error(error);
      res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
    }
  }
);

// ROUTE 4 : Delete Quiz Code DELETE "/api/quizcode/delete/:quizcode". Require Login
router.delete("/delete/:quizcode", fetchuser, async (req, res) => {
  try {
    let quizcode = await QuizCode.findOne({ quizcode: req.params.quizcode });
    if (!quizcode || quizcode.deleted) {
      return res.status(404).json({ error: "Not Found" });
    }

    if (quizcode.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not Allowed" });
    }

    quizcode.deleted = true;

    quizcode = await QuizCode.findByIdAndUpdate(quizcode.id, quizcode);

    res.json({
      Success: "QuiozCode Deleted",
      quizcode: req.params.quizcode,
    });
  } catch (error) {
    // Catch Block For Any Error in MongoDB or above code
    console.error(error);
    res.status(500).send("Internal Server Error"); // Status Code - 500 : Internal Server Error
  }
});

module.exports = router;
