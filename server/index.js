const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Backend" });
});

module.exports = app;
