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
router.get('/:customerId', function(req,res,next) {
  User.findById(req.params.customerId, (err, data) => {
    if(err) {
      if(err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.customerId}`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user data with id " + req.params.customerId
        });
      }
    } else res.send(data)
  });
});

module.exports = router;
