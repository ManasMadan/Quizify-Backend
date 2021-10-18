const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

connectToMongo();

const app = express();
let port;
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT;
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS.split(","),
    })
  );
} else {
  port = 5000;
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
  console.log(
    `Quizify listening at Port ${port}, Allowed Origins ${process.env.ALLOWED_ORIGINS.split(
      ","
    )}`
  );
});
