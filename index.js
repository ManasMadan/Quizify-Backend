const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

connectToMongo();

const app = express();
const port = process.env.PORT;

if (process.env.NODE_ENV === "production") {
  app.use(cors({ origin: "https://quizify-manas.netlify.app" }));
} else {
  app.use(cors());
}

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/quizcode", require("./routes/quizcode"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/submissions", require("./routes/submittedby"));

app.get("/", (req, res) =>
  res.json({
    Success: "Manas Madan",
  })
);

app.listen(port, () => {
  console.log(`Quizify listening at Port ${port}`);
});
