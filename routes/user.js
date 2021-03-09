const express = require('express');
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('user managment');
});

//create new
router.get('/create', function(req,res) {
  if(!req.session.user) {
    console.log("redirect")
    res.redirect("/panel");
    return;
  }

  res.render("userCreate", {name: req.session.user.name});
});

router.post('/create', function(req,res) {
  
  if(!req.body) {
    res.status(400).send({
      message: "Content can not be empty"
    });
  }

  User.findById(req.body.login, function(err, data) {
    if(data) {
      res.status(400).send({
        message: "user with passed login already exists"
      });
      return;
    }

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      const user = new User({
        name: req.body.name,
        login: req.body.login,
        password: hash
      });

      User.create(user, (err, data) => {
        if(err) {
          res.status(500).send({
            message: err.message || "Error occured while creating the User"
          });
        } else res.send(data)
      })
    });

  });
});

//find one
router.post('/login', function(req,res) {
  let {login, password} = req.body;
  User.findById(login, (err, data) => {
    if(err) {
      if(err.kind === "not_found") {
        res.status(404).render("index",{
          title: "RMA",
          error: `Login failed, wrong password or login passed`
        });
        return;
      } else {
        res.status(500).render("index", {
          title: "RMA",
          error: "Error retrieving user data with login " + login
        });
        return;
      }
    } else {
      bcrypt.compare(password, data.password, function(err,result) {
        if(err || !result) {
          res.status(401).render("index", {
            title: "RMA",
            error: "Login failed, wrong password or login passed"
          });
          return;
        }
        let id = data.ID;
        let name = data.name;
        let permissions = data.permissions
        req.session.user = {id, name, permissions};
        res.status(200).redirect("../panel")
      });
    } 
  });
});

router.post("/logout",function(req, res) {
  if(req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});


module.exports = router;
