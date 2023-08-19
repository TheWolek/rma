import App from "./app"
import dotenv from "dotenv"
import warehouseItemController from "./app/controllers/warehouse/items/warehouseItemsController"
import shelvesController from "./app/controllers/warehouse/shelves/shelvesController"

dotenv.config()

const port = process.env.PORT || "3000"

const controllers = [new warehouseItemController(), new shelvesController()]

const app = new App(controllers, port)

app.listen()
