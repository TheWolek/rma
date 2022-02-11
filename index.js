const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const warehouseItems = require('./warehouse/items')
const warehouseShelves = require('./warehouse/shelves')

// app.use(cors)
app.use(bodyParser.json())
app.use('/warehouse/items', warehouseItems)
app.use('/warehouse/shelve', warehouseShelves)

app.get('/', (req, res) => {
    res.send("Welcome to RMA system")
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})