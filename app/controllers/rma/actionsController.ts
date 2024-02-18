import express, { Request, Response } from "express"
import RmaModel from "../../models/rma/rmaModel"
import LogModel from "../../models/logs/logModel"
import throwGenericError from "../../helpers/throwGenericError"
import auth, { Roles } from "../../middlewares/auth"
import { getUserId } from "../../helpers/jwt"
import { connection } from "../../models/dbProm"
import { ActionData } from "../../types/rma/rmaTypes"
import validators from "./validators"

class RmaActionsController {
  public path = "/rma/actions"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getActions
    )

    this.router.post(this.path, auth(Roles["RmaCommon"]), this.addAction)

    this.router.put(
      `${this.path}/:id`,
      auth(Roles["RmaCommon"]),
      this.editAction
    )

    this.router.delete(
      `${this.path}/:id`,
      auth(Roles["RmaCommon"]),
      this.removeAction
    )
  }

  private Model = new RmaModel()
  private logModel = new LogModel()

  getActions = async (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.Model.getActions(
        conn,
        Number(req.params.ticketId)
      )

      await conn.commit()

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 400, String(error), error)
    } finally {
      conn.release()
    }
  }

  addAction = async (req: Request<{}, {}, ActionData>, res: Response) => {
    const { error } = validators.addEditAction.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const ticketStatus = await this.Model.getTicketStatus(
        conn,
        req.body.ticket_id
      )

      if (![5, 6].includes(ticketStatus.status)) {
        return throwGenericError(
          res,
          400,
          "Nie można dodać czynności na tym kroku"
        )
      }

      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const rowId = await this.Model.addAction(conn, req.body)

      await this.logModel.log(conn, {
        action: "addAction",
        log: `Dodano czynność: ${JSON.stringify(req.body)}`,
        ticketId: req.body.ticket_id,
        user_id: userId,
      })

      await conn.commit()

      return res.status(200).json(rowId)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  editAction = async (
    req: Request<{ id: number }, {}, ActionData>,
    res: Response
  ) => {
    const { error } = validators.addEditAction.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const ticketStatus = await this.Model.getTicketStatus(
        conn,
        req.body.ticket_id
      )

      if (![5, 6].includes(ticketStatus.status)) {
        return throwGenericError(
          res,
          400,
          "Nie można edytować czynności na tym kroku"
        )
      }

      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const action = await this.Model.getOneAction(conn, req.params.id)

      if (action.length === 0) {
        return throwGenericError(
          res,
          404,
          "Nieznaleziono czynności o podanym ID"
        )
      }

      await this.Model.editAction(conn, {
        action_id: req.params.id,
        ...req.body,
      })

      await this.logModel.log(conn, {
        action: "removeAction",
        log: `Edytowano czynność: ${JSON.stringify(action)}; ${JSON.stringify(
          req.body
        )}`,
        ticketId: action[0].ticket_id,
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

  removeAction = async (req: Request<{ id: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.id))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola id")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const action = await this.Model.getOneAction(conn, Number(req.params.id))

      if (action.length === 0) {
        return throwGenericError(
          res,
          404,
          "Nieznaleziono czynności o podanym ID"
        )
      }

      const ticketStatus = await this.Model.getTicketStatus(
        conn,
        action[0].ticket_id
      )

      if (![5, 6].includes(ticketStatus.status)) {
        return throwGenericError(
          res,
          400,
          "Nie można dodać czynności na tym kroku"
        )
      }

      await this.Model.removeAction(conn, Number(req.params.id))

      await this.logModel.log(conn, {
        action: "removeAction",
        log: `Usunięto czynność: ${JSON.stringify(action[0])}`,
        ticketId: action[0].ticket_id,
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

export default RmaActionsController
