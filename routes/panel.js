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

    RMA.genUniqueCode(function (code) {
        rma.rma = code;

        RMA.create(rma, function (err, data) {
            if (err) {
                res.status(500).send({
                    message: err.message || "Error occured while creating the RMA"
                });
            } else {
                let name = req.session.user.name;
                let permissions = req.session.user.permissions;
                res.render("rmaView", { title: "rma view", name: name, permissions: permissions, rma: data });
            }
        });
    });
});

module.exports = router;