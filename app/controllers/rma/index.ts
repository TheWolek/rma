import express, { Request, Response } from "express"
import getBarcodeFilePath from "../../helpers/rma/barcodeFiles/getBarcodeFilePath"
import throwGenericError from "../../helpers/throwGenericError"
import validators from "./validators"
import RmaModel from "../../models/rma/rmaModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  CreateReqBody,
  Filters,
  UpdateTicketReqBody,
} from "../../types/rma/rmaTypes"
import checkIfTicketExists from "../../helpers/rma/checkIfTicketExists"
import saveBarcodeFile from "../../helpers/rma/barcodeFiles/saveBarcodeFile"
import LogModel from "../../models/logs/logModel"
import { getUserId } from "../../helpers/jwt"
import { connection } from "../../models/dbProm"
import { ResultSetHeader } from "mysql2"

class RmaController {
  public path = "/rma"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/create`,
      auth(Roles["RmaCommon"]),
      this.create
    )

    this.router.get(this.path, auth(Roles["RmaCommon"]), this.find)

    this.router.get(
      `${this.path}/details`,
      auth(Roles["RmaCommon"]),
      this.findOne
    )

    this.router.put(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.editTicket
    )

    this.router.put(
      `${this.path}/register/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.register
    )

    this.router.put(
      `${this.path}/changeState/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.changeState
    )

    this.router.post(
      `${this.path}/generateBarcode`,
      auth(Roles["Admin"]),
      this.generateBarcodeFile
    )
  }

  private Model = new RmaModel()
  private logModel = new LogModel()

  create = async (req: Request<{}, {}, CreateReqBody>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

    try {
      const ticketDbResult = await this.Model.create(conn, req.body)

      this.logModel.log(conn, {
        action: "created",
        log: "Utworzono zlecenie",
        ticketId: (ticketDbResult as ResultSetHeader)?.insertId,
        user_id: userId,
      })

      const barcodeData = await this.Model.getBarcode(
        conn,
        ticketDbResult.insertId
      )

      await saveBarcodeFile({
        barcode: barcodeData[0].barcode,
        ticketId: ticketDbResult.insertId,
      })

      conn.commit()

      return res.status(200).json({
        ticketId: ticketDbResult.insertId,
      })
    } catch (error: unknown) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  generateBarcodeFile = async (
    req: Request<{}, {}, { ticketId: number; barcode: string }>,
    res: Response
  ) => {
    if (req.body.barcode === undefined || req.body.ticketId === undefined) {
      return throwGenericError(res, 400, "Pola barcode i ticketId są wymagane")
    }

    const filePath = await saveBarcodeFile(req.body)

    return res.status(200).json({ filePath })
  }

  find = async (req: Request<{}, {}, {}, Filters>, res: Response) => {
    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.Model.filter(conn, req.query)

      conn.commit()

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  findOne = async (
    req: Request<{}, {}, {}, { ticketId: string }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.query.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const row = await this.Model.getOne(conn, Number(req.query.ticketId))

      if (row[0].status >= 10) {
        row[0].barcodeURL = null
      } else {
        row[0].barcodeURL = getBarcodeFilePath(
          Number(req.query.ticketId),
          "read"
        )
      }

      conn.commit()

      return res.status(200).json(row[0])
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  editTicket = async (
    req: Request<{ ticketId: string }, {}, UpdateTicketReqBody>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.edit.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

    try {
      await this.Model.editTicket(conn, Number(req.params.ticketId), req.body)

      this.logModel.log(conn, {
        action: "editTicket",
        log: `Edytowano zgłoszenie: ${JSON.stringify(req.body)}`,
        ticketId: Number(req.params.ticketId),
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

  register = async (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const ticket = await checkIfTicketExists(Number(req.params.ticketId))

      if (ticket.length === 0) {
        return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
      }

      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      await this.Model.register(conn, Number(req.params.ticketId))

      this.logModel.log(conn, {
        action: "register",
        log: "Zarejestrowano w magazynie",
        ticketId: Number(req.params.ticketId),
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

  changeState = async (
    req: Request<{ ticketId: string }, {}, { status: number }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.changeState.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const ticket = await checkIfTicketExists(Number(req.params.ticketId))

      if (ticket.length === 0) {
        return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
      }

      await this.Model.changeState(
        conn,
        Number(req.params.ticketId),
        req.body.status
      )

      this.logModel.log(conn, {
        action: "changeStatus",
        log: `Zmieniono status na ${req.body.status}`,
        ticketId: Number(req.params.ticketId),
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

export default RmaController
