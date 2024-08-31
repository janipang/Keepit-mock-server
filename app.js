const express = require("express");
const cors = require('cors');
const fs = require("fs");
const bodyParser = require('body-parser');

function writeFile(file, data){
  const file_path = `./database/${file}.json`;
  fs.writeFileSync(file_path, JSON.stringify(data, null, 2));
}

function readFile(file){
  const file_path = `./database/${file}.json`;
  const data = fs.readFileSync(file_path, 'utf8');
  return JSON.parse(data);
}

function userIdGenerator(users){
  const maxId = users.reduce((max, user) => {
    const currentId = parseInt(user.id, 10);
    return currentId > max ? currentId : max;
  }, 0);
  const newId = (maxId + 1).toString().padStart(8, '0');
  return newId;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/user", function (req, res) {
  const { username } = req.query;
  const users = readFile("user");
  if (username) {
    
    const user = users.find(user => (user.username === username));
    
    if (user) {
      return res.send(user);
    } else {
      return res.status(404).send({ error: "User not found" });
    }
  }
  res.send(users);
});

app.get("/profile", function (req, res) {
  const profiles = readFile("profile");
  res.send(profiles);
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const users = readFile("user");
  const user = users.find(user => user.id === id);
  if (user) {
    return res.send(user);
  } else {
    return res.status(404).send({ error: "User not found" });
  }
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  const profiles = readFile("profile");
  const profile = profiles.find(profile => profile.id === id);
  if (profile) {
    return res.send(profile);
  } else {
    return res.status(404).send({ error: "Profile not found" });
  }
});

// ----------------------- post --------------------------- 

app.post("/user", (req, res) => {
  // check valid input
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ error: "username and password are required" });
  }
  // create user
  const users = readFile("user");
  const id = userIdGenerator(users);
  const profileId = `pf${id}`
  const user_exist = users.find(user => user.username === username);
  if (user_exist) {
    return res.status(409).send({ error: "Username already exists" });
  }
  const newUser = { id, username, password, profileId };
  users.push(newUser);
  writeFile("user", users)

  // create profile
  const newProfile = {id: profileId, firstName: "", lastName: "", picture: "", phone: "", role: ""}
  const profiles = readFile("profile");
  profiles.push(newProfile);
  writeFile("profile", profiles)

  return res.status(201).send( newUser );
})

app.put("/profile/:profileId", (req, res) => {
  const { firstName, lastName, picture, phone, role } = req.body;
  const profileId = req.params.profileId
  const profiles = readFile("profile");
  let profile = profiles.find(profile => profile.id === profileId);
  if (profile) {
    profile = { ...profile, firstName, lastName, picture, phone, role };
    const updated_profiles = profiles.map(p => p.id === profileId ? profile : p);
    writeFile("profile", updated_profiles)
    return res.send(profile);
  } else {
    return res.status(404).send({ error: "Profile not found" });
  }
})



app.listen(8000);
