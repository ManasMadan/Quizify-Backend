const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URL || 
  "mongodb://localhost:27017/quizify?readPreference=primary&appname=MongoDB%20Compass&ssl=false"

const connectToMongo = async () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected To MongoDB Successfully");
  });
};

module.exports = connectToMongo;
