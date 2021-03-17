const express = require('express');
const router = express.Router();
const RMA = require("../models/rma.model");

router.get("/", function(req,res) {
    if(!req.session.user) {
        res.status(401).redirect("/")
        return;
    }

    let name = req.session.user.name;
    let permissions = req.session.user.permissions;
    res.render("panel", {title: "panel RMA",name: name, permissions: permissions})
});

router.get("/create", function(req,res) {
    if(!req.session.user) {
        res.status(401).redirect("/")
        return;
    }

    let name = req.session.user.name;
    let permissions = req.session.user.permissions;
    res.render("panelCreate", {title: "Tworzenie zlecenia RMA", name: name, permissions: permissions})
});

router.post("/create", function (req, res) {
    if(!req.session.user) {
        res.status(401).redirect("/")
        return;
    }

    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty"
        });
        return;
    }

    const rma = new RMA({
        producent: req.body.producent,
        model: req.body.model,
        sn: req.body.SN,
        sprzedaz: req.body.sprzedaz,
        fv: req.body.fv,
        opis: req.body.opis,
        typ: parseInt(req.body.type),
        priorytet: parseInt(req.body.prio)
    })

    let name = req.session.user.name;
    let permissions = req.session.user.permissions;

    if (rma.producent == "" || rma.model == "" || rma.sn == "" || rma.sprzedaz == "" || rma.fv == "" || rma.opis == "" || rma.typ == "" || rma.priorytet == "") {
        let msg = "Uzupełnij pola"
        res.render("panelCreate", {title: "Tworzenie zlecenia RMA", name: name, permissions: permissions, err: msg, rma: rma})
        return;
    }

    RMA.genUniqueCode(function (code) {
        rma.rma = code;

        RMA.create(rma, function (err, data) {
            if (err) {
                res.status(500).send({
                    message: err.message || "Error occured while creating the RMA"
                });
            } else {
                // res.render("rmaView", { title: "rma view", name: name, permissions: permissions, rma: data });
                res.redirect("/panel/find/" + data.id);
            }
        });
    });
});

router.post("/create/gettypes", function (req, res) {
   RMA.getTypes(function (err, types_data) {
        if (err) {
            res.status(500).send({
                message: "error while fetching types"
            });
        }

        let types = [];

        types_data.forEach(obj => {
            let id = obj.id;
            let val = obj.typ
            let temp = {};
            temp[id] = val;
            types.push(temp);
        });

        res.json(types);
    });
});

router.post("/create/getprio", function (req, res) {
   RMA.getPrio(function (err, prio_data) {
        if (err) {
            res.status(500).send({
                message: "error while fetching prio"
            });
        }

        let prio = [];
        prio_data.forEach(obj => {
            let id = obj.id;
            let val = obj.priorytet;
            let temp = {};
            temp[id] = val;
            prio.push(temp);
        });

        res.json(prio);
    });
});

router.post("/find", function (req, res) {
    let searchText = req.body.rma;
    console.log(req.body)

    RMA.findByCode(searchText, function (err, data) {
        if (err) {
            if (err.kind === "not_found") {
                res.json(data)
                return;
            } else {
                res.status(500).json({
                    message: "error while searching for rma"
                });
                return;
            }
        }
        
        res.json(data);
    });
});

router.get("/find/:id", function (req, res) {
    if(!req.session.user) {
        res.status(401).redirect("/")
        return;
    }
    let id = req.params.id;

    RMA.findById(id, function (err, data) {
        if (err) {
            if (err.kind == "not_found") {
                res.json({
                    message: "not found"
                });
            } else {
                res.status(500).json({
                    message: "error while searching for rma"
                });
            }
        }

        // let name = req.session.user.name;
        // let permissions = req.session.user.permissions;
        // let date = new Date(data.sprzedaz);
        // let day = date.getDate()
        // let month = date.getMonth() + 1
        // if(day < 10) day = "0" + day
        // if(month < 10) month = "0" + month
        // data.sprzedaz = date.getFullYear() + "-" + month + "-" + day;
        // res.render("rmaView", { title: "RMA view", name: name, permissions: permissions, rma: data });
        res.json(data);
    })
});

module.exports = router;