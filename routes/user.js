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
router.post('/create', function(req,res,next) {
  
  if(!req.body) {
    res.status(400).send({
      message: "Content can not be empty"
    });
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

//find one
router.post('/login', function(req,res,next) {
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
        req.session.user = {id, name};
        res.status(200).redirect("../panel")
      });
    } 
  });
});



module.exports = router;
