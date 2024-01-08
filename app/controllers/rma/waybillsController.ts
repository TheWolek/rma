import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import WaybillsModel from "../../models/rma/waybillsModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  CreateWaybillBody,
  FindWaybillReqQuery,
  EditWaybillBody,
} from "../../types/rma/rmaTypes"
import validators from "./validators"
import { checkIfWaybillExists } from "../../helpers/waybills/checkIfWaybillExists"
import { getUserId } from "../../helpers/jwt"
import { connection } from "../../models/dbProm"
import LogModel from "../../models/logs/logModel"

class RmaWaybillsController {
  public path = "/rma/waybills"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(this.path, auth(Roles["RmaCommon"]), this.find)
    this.router.post(this.path, auth(Roles["RmaCommon"]), this.create)
    this.router.put(`${this.path}/:id`, auth(Roles["RmaCommon"]), this.edit)
  }

  private Model = new WaybillsModel()
  private logModel = new LogModel()

  find = async (
    req: Request<{}, {}, {}, FindWaybillReqQuery>,
    res: Response
  ) => {
    const isWaybillNumber =
      req.query.waybillNumber !== undefined &&
      req.query.waybillNumber !== null &&
      req.query.waybillNumber !== ""
    const isTicketId =
      req.query.ticketId !== undefined &&
      req.query.ticketId !== null &&
      req.query.ticketId !== ""

    if (isWaybillNumber && isTicketId) {
      return throwGenericError(res, 400, "Podaj tylko jeden z parametrów")
    }
    if (!isWaybillNumber && !isTicketId) {
      return throwGenericError(res, 400, "Podaj przynajmniej jeden parametr")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.Model.find(conn, req.query)

      conn.commit()

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  create = async (req: Request<{}, {}, CreateWaybillBody>, res: Response) => {
    const { error } = validators.createWaybill.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const dbResult = await this.Model.create(conn, req.body)

      this.logModel.log(conn, {
        action: "waybillCreated",
        log: `Utworzono list przewozowy: ${req.body.waybillNumber}, ${req.body.type}`,
        ticketId: req.body.ticketId,
        user_id: userId,
      })

      conn.commit()

      return res.status(200).json({
        id: dbResult.insertId,
      })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  edit = async (
    req: Request<{ id: string }, {}, EditWaybillBody>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola id")
    }

    const { error } = validators.editWaybill.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const waybill = await checkIfWaybillExists(Number(req.params.id))

      if (waybill.length === 0) {
        return throwGenericError(res, 404, "Brak listu o podanym ID")
      }

      await this.Model.edit(conn, Number(req.params.id), req.body)

      await this.logModel.log(conn, {
        action: "waybillEdit",
        log: `Edytowano list przewozowy: ${req.body.waybillNumber}, ${req.body.type}, ${req.body.status}`,
        ticketId: req.body.ticketId,
        user_id: userId,
      })

      conn.commit()

      return res.status(200).json({})
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default RmaWaybillsController
