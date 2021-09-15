const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

const connectToMongo = async () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected To MongoDB Successfully");
  });
};

module.exports = connectToMongo;
