require("dotenv").config();

const mongoose = require("mongoose");

let mongoURI;
if (process.env.NODE_ENV === "production") {
  mongoURI = process.env.MONGO_URI;
} else {
  mongoURI =
    "mongodb://localhost:27017/quizify?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
}

const connectToMongo = async () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected To MongoDB Successfully");
  });
};

module.exports = connectToMongo;
