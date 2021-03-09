const express = require('express');
const router = express.Router();

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
    res.send(req.body)
});

module.exports = router;