import express, { Request, Response } from "express"
import LogModel from "../../models/logs/logModel"
import throwGenericError from "../../helpers/throwGenericError"
import auth, { Roles } from "../../middlewares/auth"

class LogsController {
  public path = "/logs"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getLogs
    )
  }

  private Model = new LogModel()

  getLogs = async (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const rows = await this.Model.getLogs(Number(req.params.ticketId))

    return res.status(200).json(rows)
  }
}

export default LogsController
