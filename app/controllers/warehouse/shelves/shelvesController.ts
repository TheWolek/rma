import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import shelvesModel from "../../../models/warehouse/shelves/shelvesModel"
import { MysqlError, OkPacket } from "mysql"
import auth, { Roles } from "../../../middlewares/auth"

class shelvesController {
  public path = "/warehouse/shelve"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(`${this.path}/add`, auth(Roles.Admin), this.addShelve)
    this.router.get(this.path, auth(Roles.Common), this.getAll)
  }

  private ShelveModel = new shelvesModel()

  addShelve = (req: Request<{}, {}, { code: string }>, res: Response) => {
    if (!req.body.code)
      return throwGenericError(res, 400, "Pole code jest wymagane")

    this.ShelveModel.addNew(
      req.body.code,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res
          .status(200)
          .json({ id: dbResult.insertId, code: req.body.code })
      }
    )
  }

  getAll = (req: Request, res: Response) => {
    this.ShelveModel.getAll((err: MysqlError, rows: any) => {
      if (err) return throwGenericError(res, 500, err, err)
      return res.status(200).json(rows)
    })
  }
}

export default shelvesController
