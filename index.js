const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const warehouseItems = require('./warehouse/items')

// app.use(cors)
app.use(bodyParser.json())
app.use('/warehouse/item', warehouseItems)

app.get('/', (req, res) => {
    res.send("Welcome to RMA system")
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})