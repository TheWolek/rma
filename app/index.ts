import bodyParser from "body-parser"
import cors from "cors"
import express from "express"

class App {
  public app: express.Application
  public port: string

  constructor(controllers: any, port: string) {
    this.app = express()
    this.port = port

    this.initMiddlewares()
    this.initControllers(controllers)
  }

  private initMiddlewares() {
    this.app.use(bodyParser.json())
    this.app.use(cors())
    this.app.use("/static", express.static("public"))
  }

  private initControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use("/", controller.router)
    })
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`API listening on the port ${this.port}`)
    })
  }
}

export default App
