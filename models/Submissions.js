const mongoose = require("mongoose");
const { Schema } = mongoose;

const Submissions = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  quizcode: {
    type: String,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
  marksAwarded: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("submissions", Submissions);
