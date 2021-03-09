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
};

User.findById = function(login, result) {
    sql.query(`SELECT * FROM USERS WHERE login = '${login}'`, function(err, res) {
        if(err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if(res.length) {
            console.log("found user: ",res[0]);
            result(null, res[0])
            return;
        }

        result({kind: "not_found"},null)
    });
};

module.exports = User;