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

function idGenerator(data, prefix){
  let maxNumber = 0;
  data.forEach(item => {
    if (item.id.startsWith(prefix)) {
      const numberPart = parseInt(item.id.slice(prefix.length), 10);
      if (numberPart > maxNumber) {
        maxNumber = numberPart;
      }
    }
  });
  const newNumber = (maxNumber + 1).toString().padStart(8, '0');
  return `${prefix}${newNumber}`;

}

const app = express();
app.use(cors());
app.use(bodyParser.json());


// ----------------------- get --------------------------- 

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

app.get("/enterprise", function (req, res) {
  const enterprises = readFile("enterprise");
  res.send(enterprises);
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

app.get("/enterprise/:id", (req, res) => {
  const { id } = req.params;
  const enterprises = readFile("enterprise");
  const enterprise = enterprises.find(enterprise => enterprise.id === id);
  if (enterprise) {
    return res.send(enterprise);
  } else {
    return res.status(404).send({ error: "Enterprise not found" });
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
  const id = idGenerator(users, "us");
  const profileId = id.replace("us", "pf");
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

app.post("/enterprise", (req,res) => {
  const enterprise = req.body;
  const enterprises = readFile("enterprise");
  const documents = readFile("document");
  const id = idGenerator(enterprises, "en");
  const docsAchiveId = idGenerator(documents, "dc");

  // create enterprise
  const newEnterprise = { id, ...enterprise, documentArchiveId: docsAchiveId, AdminId : []};
  console.log(newEnterprise);
  enterprises.push(newEnterprise)
  writeFile("enterprise", enterprises)

  // create documentArchive
  const newDocsArchive = {id: docsAchiveId, income: [], expense: []}
  documents.push(newDocsArchive)
  writeFile("document", documents)
  
  return res.status(201).send( newEnterprise );
})

// ----------------------- pีt --------------------------- 

app.put("/profile/:profileId", (req, res) => {
  const { firstName, lastName, picture, phone, role } = req.body;
  console.log( firstName, lastName, picture, phone, role )
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