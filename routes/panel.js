const express = require('express');
const router = express.Router();

router.get("/", function(req,res,next) {
    if(!req.session.user) {
        res.status(401).redirect("/")
        return;
    }

    let name = req.session.user.name
    res.render("panel", {name: name})
});

module.exports = router;