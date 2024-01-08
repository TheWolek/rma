import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import RmaModel from "../../models/rma/rmaModel"
import validators from "./validators"
import auth, { Roles } from "../../middlewares/auth"
import { getUserId } from "../../helpers/jwt"
import { connection } from "../../models/dbProm"
import LogModel from "../../models/logs/logModel"

class RmaAccessoriesController {
  public path = "/rma/accessories"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getAccessories
    )

    this.router.put(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.editAccessories
    )
  }

  private Model = new RmaModel()
  private logModel = new LogModel()

  getAccessories = async (
    req: Request<{ ticketId: string }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.Model.getAccessories(
        conn,
        Number(req.params.ticketId)
      )

      await conn.commit()

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  editAccessories = async (
    req: Request<{ ticketId: string }, {}, { deviceAccessories: number[] }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.editAccessories.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      await this.Model.editAccessories(
        conn,
        Number(req.params.ticketId),
        req.body.deviceAccessories
      )

      await this.logModel.log(conn, {
        action: "editAccessories",
        log: `Edytowano akcesoria: ${JSON.stringify(
          req.body.deviceAccessories
        )}`,
        ticketId: Number(req.params.ticketId),
        user_id: userId,
      })

      await conn.commit()

      return res.status(200).json({})
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default RmaAccessoriesController
