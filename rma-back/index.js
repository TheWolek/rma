const express = require("express")
const bcrypt = require("bcrypt")
const saltRounds = 10
const path = require("path")
const session = require("express-session")

const app = express()
app.use(express.json())
const port = 3000;

// const user list (DATA BASE)
const USERS = {
  admin: {name: "Admin"}
}

bcrypt.hash("admin123", saltRounds, function(err,hash) {
  if(err) throw err
  USERS.admin.hash = hash
  console.log(USERS.admin)
})


/////////////////////////////

app.get("/", function (req, res) {
  res.json(USERS.admin)
});

function authenticate(name, pass, fn) {
  function handleLoginError() {
    let error = new Error()
    error.msg = "invalid password or username"
    error.status = 401
    return error
  }
  let user = USERS[name];
  console.log(user)
  console.log(name, pass)
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

app.post("/user/login", function (req,res) {
  let {username,password} = req.body
  authenticate(username, password, function(err, result) {
    if(err) res.status(err.status).send(err)

    res.send(result)
  }) 
})

app.listen(port, () => {
  console.log("listening @ " + port);
});
