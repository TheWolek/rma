const express = require("express")
const bcrypt = require("bcrypt")
const saltRounds = 10

const login = require("./controllers/login")

const app = express()
app.use(express.json())
const port = 3000;


// const user list (DATA BASE)
let USERS = {
  admin: {name: "Admin"}
}

bcrypt.hash("admin123", saltRounds, function(err,hash) {
  if(err) throw err
  USERS.admin.hash = hash
})


app.set('USERS',USERS)
app.set('devMode',true)
/////////////////////////////

app.get("/", function (req, res) {
  res.json(USERS.admin)
});



app.use("/user/login", login)

app.listen(port, () => {
  console.log("listening @ " + port);
});
