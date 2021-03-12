const sql = require("./db");

const RMA =function(rma) {
    this.rma = rma.rma;
    this.producent = rma.producent;
    this.model = rma.model;
    this.sn = rma.sn;
    this.sprzedaz = rma.sprzedaz;
    this.fv = rma.fv;
    this.opis = rma.opis;
};

RMA.create = function(newRMA, result) {
    sql.query("INSERT INTO ZLECENIA SET ?", newRMA, function(err,res) {
        if(err) {
            console.log("error: ",err);
            result(err,null);
            return;
        }

        console.log("created RMA: ", {id: res.insertId, ...newRMA});
        result(null, {id: res.insertId, ...newRMA});
    });
};

RMA.findByCode = function(code, result) {
    sql.query(`SELECT * FROM ZLECENIA WHERE rma = '${code}'`, function(err, res) {
        if(err) {
            console.log("error: ", err);
            result(err,null);
            return;
        }

        if(res.length) {
            console.log("found rma: ", res[0]);
            result(null, res[0]);
            return;
        }
        
        result({kind: "not_found"}, null);
    });
};

RMA.genUniqueCode = function (result) {
    function genRandomRMA() {
        let date = new Date();
        date = date.getFullYear().toString().substring(2, 4);
        return "RMA/" + Math.round(Math.random() * 1000).toString() + "/" + date;
    }

    function CheckIfUnique(code) {
        sql.query(`SELECT * from ZLECENIA WHERE rma = '${code}'`, function (err, res) {
            if (err) {
                throw err;
            } else {
                if (res.length) {
                    console.log("found the same, generating new...");
                    let c = genRandomRMA();
                    console.log("trying ", c);
                    CheckIfUnique(c);
                } else {
                    console.log(`rma ${code} is unique, return true`)
                    result(true);
                }   
            }
        });
    }

    let b = genRandomRMA();
    console.log("trying ", b);
    CheckIfUnique(b);
};

RMA.getLast = function(result) {
    sql.query(`SELECT id, rma FROM ZLECENIA ORDER BY id DESC LIMIT 1`, function(err, res) {
        if(err) {
            console.log("error: ",err);
            result(err,null);
            return;
        }

        if(res.length) {
            console.log("found last: ", res[0]);
            result(null, res[0]);
            return;
        }

        result({kind: "not_found"},null);
    });
};

module.exports = RMA;
