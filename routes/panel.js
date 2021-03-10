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

router.post("/create", function(req,res) {
    if(!req.body) {
        res.status(400).send({
            message: "Content can not be empty"
        });
    }

    const rma = new RMA({
        producent: req.body.producent,
        model: req.body.model,
        sn: req.body.SN,
        sprzedaz: req.body.sprzedaz,
        fv: req.body.fv,
        opis: req.body.opis
    })

    RMA.getLast(function (err, data) {
        if (err) {
            if (err.kind === "not_found") {
                console.log("not found")
                
                let date = new Date();
                date = date.getFullYear();
                date = "" + date;
                date = date.substring(2, 4);
                
                let code = "RMA/1/" + date;
                console.log("new code: ", code);
                
                rma.rma = code;

                RMA.create(rma, (err,data) => {
                    if(err) {
                        res.status(500).send({
                            message: err.message || "Error occured while creating the RMA"
                        });
                    } else res.send(data);
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error occured while creating the RMA (code)"
                });
                return true;
            }
        } else {
            let code = parseInt(data.rma.substring(4, data.length)) + 1;

            console.log(code)
            let date = new Date();
            date = date.getFullYear();
            date = "" + date;
            date = date.substring(2, 4);
                
            code = "RMA/" + code + "/" + date;
            console.log("code: ", code);
                
            rma.rma = code;

            RMA.create(rma, (err,data) => {
                if(err) {
                    res.status(500).send({
                        message: err.message || "Error occured while creating the RMA"
                    });
                } else res.send(data);
            });
        }
    });
});

module.exports = router;