const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

connectToMongo();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/quizcode", require("./routes/quizcode"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/submissions", require("./routes/submissions"));

app.get("/", (req, res) =>
  res.json({
    "/api/auth/createuser":
      "Create User : POST Request name,email,password : required => returns auth token",
    "/api/auth/login":
      "Login User : POST Request email,password : required => returns auth token",
    "/api/auth/getuser":
      "Get User Data : POST Request auth-token in header : required => returns User Data",
    "/api/notes/fetchallnotes":
      "Get User's Notes if logged in : GET Request auth-token in header : required => returns User's Notes",
    "/api/notes/addnote":
      "Create Note if logged in : POST Request auth-token in header : required, title,description : required ,tag,date : optional => returns Created Note",
    "/api/notes/updatenote/:id":
      "Update Note if logged in and his note : PUT Request auth-token in header : required, title,description : required ,tag : optional => returns Updated Note",
    "/api/notes/delete/:id":
      "Delete Note if logged in and his note : DELETE Request auth-token in header : required => returns Deleted Note",
  })
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
