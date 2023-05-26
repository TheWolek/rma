const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();

const warehouseItems = require("./warehouse/items");
const warehouseShelves = require("./warehouse/shelves");

const spareParts = require("./warehouse/spareparts");
const sparePartsAdd = require("./warehouse/spareparts/add");
const sparePartsOrders = require("./warehouse/spareparts/orders");
const sparePartsOrdersItems = require("./warehouse/spareparts/ordersItems");
const sparePartsShelve = require("./warehouse/spareparts/shelve");

const rma = require("./rma");
const rmaCreate = require("./rma/create");
const waybills = require("./rma/waybills");
const rmaDictionaries = require("./rma/dictionaries");

app.use(cors());
app.use(bodyParser.json());
app.use("/warehouse/items", warehouseItems);
app.use("/warehouse/shelve", warehouseShelves);
app.use("/warehouse/spareparts/add", sparePartsAdd);
app.use("/warehouse/spareparts/orders", sparePartsOrders);
app.use("/warehouse/spareparts/orders/items", sparePartsOrdersItems);
app.use("/warehouse/spareparts/shelve", sparePartsShelve);
app.use("/warehouse/spareparts", spareParts);
app.use("/rma/", rma);
app.use("/rma/create/", rmaCreate);
app.use("/rma/waybills/", waybills);
app.use("/rma/dictionary/", rmaDictionaries);

app.get("/", (req, res) => {
  res.send("Welcome to RMA system");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
