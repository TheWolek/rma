const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")

function authenticate(name, pass, fn) {
  function handleLoginError() {
    let error = new Error()
    error.msg = "invalid password or username"
    error.status = 401
    return error
  }

  let user = USERS[name];
  if (!user)  {
    return fn(handleLoginError())
  }

  bcrypt.compare(pass, user.hash, function(err, result) {
    if(err) return fn(err)
    if(!result) {
      return fn(handleLoginError())
    }
    return fn(null, result)
  })
}

router.post("/", function(req, res) {
    let USERS = req.app.get("USERS")
    let devMode = req.app.get("devMode")

    ////////
    if(devMode) console.log(req.body)
    let {username,password} = req.body
    authenticate(username, password, function(err, result) {
        if(err) {
        if(devMode) console.log(err)
        res.status(err.status).send(err)
        }
        if(!err && devMode) console.log(result)
        res.send(result)
    })
})

module.exports = router