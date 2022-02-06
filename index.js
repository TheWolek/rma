const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const tickets = require('./tickets/tickets.js')

// app.use(cors)
app.use(bodyParser.json())
app.use(tickets)

app.get('/', (req, res) => {
    res.send("Welcome to RMA system")
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})