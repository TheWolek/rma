const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const session = require("express-session");

const sessionChecker = function(req,res,next) {
  console.log("session Check ", req.session, req.cookies)
  if(req.session.user && req.cookies.user_uid) {
    res.redirect("/panel");
  } else {
    next();
  }
};

/* GET home page. */
router.get('/', sessionChecker ,function(req, res) {
  res.render('index', { title: 'RMA' });
});

module.exports = router;
