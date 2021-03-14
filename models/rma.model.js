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

RMA.findByCode = function (code, result) {
    sql.query(`SELECT ZLECENIA.id, zlecenia.rma, typy_priorytet.priorytet, typy_zlecen.typ, zlecenia.status, typy_statusy.status as status_zlecenia, zlecenia.producent, zlecenia.model, zlecenia.sn, zlecenia.sprzedaz, zlecenia.fv, zlecenia.opis FROM ZLECENIA, typy_statusy, typy_zlecen, typy_priorytet WHERE ZLECENIA.rma like '%${code}%' and ZLECENIA.status_realizacji = typy_statusy.id and ZLECENIA.typ = typy_zlecen.id and ZLECENIA.priorytet = typy_priorytet.id limit 15 offset 0`, function(err, res) {
        if(err) {
            console.log("error: ", err);
            result(err,null);
            return;
        }

        if(res.length) {
            console.log("found rma: ", res);
            result(null, res);
            return;
        }
        
        result({kind: "not_found"}, []);
    });
};

RMA.findById = function (id, result) {
    sql.query(`SELECT * FROM ZLECENIA WHERE id=${id}`, function (err, res) {
        if (err) {
            console.log("err: ", err);
            result(err, null);
            return;
        }
        
        if(res.length) {
            console.log("found rma: ", res[0]);
            result(null, res);
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
                    console.log(`rma ${code} is unique`)
                    result(code);
                }   
            }
        });
    }

    let b = genRandomRMA();
    console.log("trying ", b);
    CheckIfUnique(b);
};

RMA.getTypes = function (result) {
    sql.query(`SELECT * FROM typy_zlecen`, function (err, res) {
        if (err) {
            console.log("err: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

RMA.getPrio = function (result) {
    sql.query(`SELECT * FROM typy_priorytet`, function (err, res) {
        if (err) {
            console.log("err: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

RMA.getStatuses = function (result) {
    sql.query(`SELECT * FROM typy_statusy`, function (err, res) {
        if (err) {
            console.log("err: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = RMA;
