const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const creds = require('../../db_creds')
const connection = mysql.createConnection(creds)

connection.connect()

//get all items in specific shelve
router.get("/", (req, res) => {

})

//change shelve of part
router.put("/", (req, res) => {

})

module.exports = router