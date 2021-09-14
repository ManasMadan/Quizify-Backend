const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubmittedBy = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  quizcode: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("submittedby", SubmittedBy);
