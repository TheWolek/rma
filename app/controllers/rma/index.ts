import express, { Request, Response } from "express"
import getBarcodeFilePath from "../../helpers/rma/barcodeFiles/getBarcodeFilePath"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import validators from "./validators"
import RmaModel from "../../models/rma/rmaModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  BarcodeTicketData,
  CreateReqBody,
  DetailsRow,
  FilteredRow,
  Filters,
  UpdateTicketReqBody,
} from "../../types/rma/rmaTypes"
import checkIfTicketExists from "../../helpers/rma/checkIfTicketExists"
import saveBarcodeFile from "../../helpers/rma/barcodeFiles/saveBarcodeFile"

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

  create = (req: Request<{}, {}, CreateReqBody>, res: Response) => {
    const { error } = validators.create.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.create(req.body, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      this.Model.getBarcode(
        dbResult.insertId,
        async (err: MysqlError, row: BarcodeTicketData) => {
          if (err) {
            return throwGenericError(res, 500, err, err)
          }

          await saveBarcodeFile({
            barcode: row.barcode,
            ticketId: dbResult.insertId,
          })

          return res.status(200).json({ ticketId: dbResult.insertId })
        }
      )
    })
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

  find = (req: Request<{}, {}, {}, Filters>, res: Response) => {
    this.Model.filter(req.query, (err: MysqlError, rows: FilteredRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  findOne = (req: Request<{}, {}, {}, { ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.query.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    this.Model.getOne(
      Number(req.query.ticketId),
      (err: MysqlError, row: DetailsRow) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        if (row.status >= 10) {
          row.barcodeURL = null
        } else {
          row.barcodeURL = getBarcodeFilePath(
            Number(req.query.ticketId),
            "read"
          )
        }

        return res.status(200).json(row)
      }
    )
  }

  editTicket = (
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

    this.Model.editTicket(
      Number(req.params.ticketId),
      req.body,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({})
      }
    )
  }

  register = (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    checkIfTicketExists(Number(req.params.ticketId))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
        }

        this.Model.register(
          Number(req.params.ticketId),
          (err: MysqlError, dbResult: OkPacket) => {
            if (err) {
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json({})
          }
        )
      })
      .catch((e) => throwGenericError(res, 500, e, e))
  }

  changeState = (
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

    checkIfTicketExists(Number(req.params.ticketId))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
        }

        this.Model.changeState(
          Number(req.params.ticketId),
          req.body.status,
          (err: MysqlError, dbResult: boolean) => {
            if (err) {
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json({})
          }
        )
      })
      .catch((e) => throwGenericError(res, 500, e, e))
  }
}

export default RmaController
