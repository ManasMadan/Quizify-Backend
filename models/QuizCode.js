const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizCode = new Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true,
  },
  quizcode:{
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("quizcodes", QuizCode);
