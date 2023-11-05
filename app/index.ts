import bodyParser from "body-parser"
import cors from "cors"
import express from "express"

//TEMP old controllers
import sparePartsShelve from "../warehouse/spareparts/shelve"
import tasks from "../warehouse/tasks"
import collectPackages from "../warehouse/collectPackages"
import collectPackagesAdd from "../warehouse/collectPackages/add"
import collectPackagesItems from "../warehouse/collectPackages/items"

class App {
  public app: express.Application
  public port: string

  constructor(controllers: any, port: string) {
    this.app = express()
    this.port = port

    this.initMiddlewares()
    this.initControllers(controllers)
    this.initOldControllers()
  }

  private initMiddlewares() {
    this.app.use(bodyParser.json())
    this.app.use(cors())
  }

  private initControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use("/", controller.router)
    })
  }

  private initOldControllers() {
    this.app.use("/warehouse/spareparts/shelve", sparePartsShelve)
    this.app.use("/warehouse/tasks/", tasks)
    this.app.use("/warehouse/collect/", collectPackages)
    this.app.use("/warehouse/collect/add", collectPackagesAdd)
    this.app.use("/warehouse/collect/items", collectPackagesItems)
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`API listening on the port ${this.port}`)
    })
  }
}

export default App
