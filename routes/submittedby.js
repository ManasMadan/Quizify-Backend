const express = require("express");
const router = express.Router();
const SubmittedBy = require("../models/SubmittedBy"); // Submissions Schema
const fetchuser = require("../middleware/fetchuser");
const fetchquizcode = require("../middleware/fetchquizcode");

// ROUTE 1 : Create A Submissions using: POST "/api/submissions/createsubmittedby". Require Login
router.post(
  "/createsubmittedby",
  fetchuser,
  fetchquizcode,
  async (req, res) => {
    // Try Catch Block
    try {
      if (req.quizcodeDeleted) {
        res.status(400).json({ error: "Quizcode has been deleted" });
      }

      const quizcode = req.quizcode;

      let submission = await SubmittedBy.findOne({
        user: req.user.id,
        quizcode,
      });

      if (submission) {
        return res.status(400).json({ error: "You Have Already Submitted" });
      }

      submission = await SubmittedBy.create({
        user: req.user.id,
        quizcode,
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
