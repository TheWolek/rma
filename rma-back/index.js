const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/user/login", (req,res) => {
  res.send("login")
})

app.listen(port, () => {
  console.log("listening @ " + port);
});
