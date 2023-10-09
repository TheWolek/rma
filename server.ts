import App from "./app"
import dotenv from "dotenv"
import warehouseItemController from "./app/controllers/warehouse/items/warehouseItemsController"
import shelvesController from "./app/controllers/warehouse/shelves/shelvesController"
import sparepartsController from "./app/controllers/warehouse/spareparts/sparepartsController"
import sparePartsOrdersController from "./app/controllers/warehouse/spareparts/orders/sparepartsOrdersController"
import sparePartsOrdersItemsController from "./app/controllers/warehouse/spareparts/orders/items/sparepartsOrdersItemsController"

dotenv.config()

const port = process.env.PORT || "3000"

const controllers = [
  new warehouseItemController(),
  new shelvesController(),
  new sparepartsController(),
  new sparePartsOrdersController(),
  new sparePartsOrdersItemsController(),
]

const app = new App(controllers, port)

app.listen()
