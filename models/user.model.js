const sql = require("./db");

const User = function(user) {
    this.name = user.name;
    this.login = user.login;
    this.password = user.password;
};

User.create = function(newUser, result) {
    sql.query("INSERT INTO USERS SET ?", newUser, function(err, res) {
        if(err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created user: ", {id: res.insertId, ...newUser});
        result(null, {id: res.insertId, ...newUser});
    });
    sql.end();
};

User.findById = function(userId, result) {
    sql.query(`SELECT * FROM USERS WHERE id= ${userId}`, function(err, res) {
        if(err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if(res.length) {
            console.log("found customer: ",res[0]);
            result(null, res[0])
            return;
        }

        result({kind: "not_found"},null)
    });
    sql.end();
};

module.exports = User;