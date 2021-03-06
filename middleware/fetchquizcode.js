const QuizCode = require("../models/QuizCode"); // QuizCode Schema

const fetchquizcode = async (req, res, next) => {
  const quizcode = req.body.quizcode || req.params.quizcode;

  // If Quizcode Not Valid
  if (!quizcode) {
    return res.status(401).send({ error: "Enter A Valid Quizcode" }); // Send Bad Response
  }

  // Try Catch Block To Verify Quizcode
  try {
    const data = await QuizCode.find({ quizcode: quizcode });
    if (!data) {
      return res.status(404).json({ error: "Not Found" });
    }
    if (data.deleted) {
      return res.status(404).json({ error: "Quizcode has been deleted" });
    }
    req.quizcode = data[0].quizcode;
    req.quizcodeDeleted = data[0].deleted;
    next(); // Run Next Function
  } catch (error) {
    res.status(401).send({ error: "Enter A Valid Quizcode" });
  }
};

module.exports = fetchquizcode;
