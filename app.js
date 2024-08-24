const express = require("express");
const fs = require("fs");

function fetchUser() {
  try {
    const jsonString = fs.readFileSync("./database/user.json");
    const user = JSON.parse(jsonString);
    return user;
  } catch (err) {
    console.log(err);
    return;
  }
};

const app = express();

app.get("/user", function (req, res) {
  const { name, email } = req.query;
  const user = fetchUser();
  res.send(user);
});

app.get("/user/:username", (req, res) => {
  res.send(`Ahoy! ${req.params.name}`);
});

app.listen(8000);
