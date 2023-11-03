import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import validators from "./validators"
import RmaModel from "../../models/rma/rmaModel"
import auth, { Roles } from "../../middlewares/auth"
import { createReqBody } from "../../types/rma/rmaTypes"

class RmaController {
  public path = "/rma/create"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(this.path, auth(Roles["RmaCommon"]), this.create)
  }

  private Model = new RmaModel()

  create = (req: Request<{}, {}, createReqBody>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.create(req.body, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json({ ticketId: dbResult.insertId })
    })
  }
}

export default RmaController
