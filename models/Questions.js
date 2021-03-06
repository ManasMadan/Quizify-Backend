const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isMathEquation: {
    type: Boolean,
    required: true,
  },
  quizcode: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
  },
  questionStatement: {
    type: String,
    required: true,
  },
  questionOptions: {
    type: Array,
  },
  questionMarks: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("questions", QuestionSchema);
