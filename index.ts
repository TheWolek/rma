import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import warehouseItems from "./warehouse/items";
import warehouseShelves from "./warehouse/shelves";
import sparePartsAdd from "./warehouse/spareparts/add";
import spareParts from "./warehouse/spareparts/index";
import sparePartsShelve from "./warehouse/spareparts/shelve";
import sparePartsOrders from "./warehouse/spareparts/orders";
import sparePartsOrdersItems from "./warehouse/spareparts/ordersItems";
import rma from "./rma/index";
import rmaCreate from "./rma/create";
import rmaDictionaries from "./rma/dictionaries";
import rmaWaybills from "./rma/waybills";

const app: Express = express();
const port = 3000;
dotenv.config();

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
app.use("/rma/waybills/", rmaWaybills);
app.use("/rma/dictionary/", rmaDictionaries);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to RMA system");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
