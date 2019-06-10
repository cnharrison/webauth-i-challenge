const express = require("express");
const server = express();
const bcrypt = require("bcrypt");
const session = require("express-session");

const sessionConfig = {
  name: "monkey",
  secret: "super secret string",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true
  }
};

server.use(session(sessionConfig));
server.use(express.json());

require("dotenv").config();

const db = require("./helpers/helpers.js");

const port = process.env.PORT || 9090;

server.listen(port, () => {
  console.log("user server listening");
});

server.post("/api/register", (req, res) => {
  let user = req.body;

  if (!user.user || !user.password) {
    return res.status(500).json({ message: "username and password required" });
  }

  const hash = bcrypt.hashSync(user.password, 14);
  user.password = hash;

  db.insert(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post("/api/login", (req, res) => {
  let { user, password } = req.body;
  db.findByUser(user)
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;

        res.status(200).json({ message: `welcome ${user.user}` });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// function authorize(req, res, next) {
//   const user = req.headers["x-user"];
//   const password = req.headers["x-password"];

//   if (!user || !password) {
//     return res.status(401).json({ message: "invalid credentials" });
//   }

//   db.findByUser(user)
//     .first()
//     .then(user => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         next();
//       } else {
//         res.status(401).json({ message: "invalid creds" });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// }

function authorize(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "not authorized" });
  }
}

server.get("/api/users", authorize, (req, res) => {
  db.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/api/logout", (req, res) => { 
  req.session.destroy((err) => { 
    if (err) { 
      console.log(err)
      return res.status(500).json({ message: "there was an error"});
    }
    res.end();
  })
})