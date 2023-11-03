import App from "./app"
import dotenv from "dotenv"
import warehouseItemController from "./app/controllers/warehouse/items/warehouseItemsController"
import shelvesController from "./app/controllers/warehouse/shelves/shelvesController"
import sparepartsController from "./app/controllers/warehouse/spareparts/sparepartsController"
import sparePartsOrdersController from "./app/controllers/warehouse/spareparts/orders/sparepartsOrdersController"
import sparePartsOrdersItemsController from "./app/controllers/warehouse/spareparts/orders/items/sparepartsOrdersItemsController"
import AuthController from "./app/controllers/auth/authController"
import DictionariesController from "./app/controllers/rma/dictionaires/dictionariesController"
import RmaController from "./app/controllers/rma"

dotenv.config()

const port = process.env.PORT || "3000"

const controllers = [
  new AuthController(),
  new warehouseItemController(),
  new shelvesController(),
  new sparepartsController(),
  new sparePartsOrdersController(),
  new sparePartsOrdersItemsController(),
  new DictionariesController(),
  new RmaController(),
]

const app = new App(controllers, port)

app.listen()
