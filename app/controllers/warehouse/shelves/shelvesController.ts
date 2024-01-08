import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import shelvesModel from "../../../models/warehouse/shelves/shelvesModel"
import auth, { Roles } from "../../../middlewares/auth"
import { connection } from "../../../models/dbProm"

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

  addShelve = async (req: Request<{}, {}, { code: string }>, res: Response) => {
    if (!req.body.code)
      return throwGenericError(res, 400, "Pole code jest wymagane")

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const dbResult = await this.ShelveModel.addNew(conn, req.body.code)
      return res
        .status(200)
        .json({ id: dbResult.insertId, code: req.body.code })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  getAll = async (req: Request, res: Response) => {
    const conn = await connection.getConnection()

    try {
      const rows = await this.ShelveModel.getAll(conn)
      return res.status(200).json(rows)
    } catch (error) {
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default shelvesController
