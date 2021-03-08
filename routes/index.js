const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RMA' });
});

router.post("/login",function(req,res,next){
  function handleError() {
    let error = new Error();
    error.status = 401;
    error.msg = "invalid username or password"
    return error;
  }

  let {login, password} = req.body;
  if(login == "" || password == "") {
    let err = handleError()
    res.status(err.status).render("index", {title: "RMA", error: err.msg})
    return
  }

  bcrypt.compare(password, "hash", function(err, result) {
      if(result) {
        res.json(login)
      } else {
        let err = handleError()
        res.status(err.status).render("index", {title: "RMA", error: err.msg})
        return
      }
  })  
})

module.exports = router;
