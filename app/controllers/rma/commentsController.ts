import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import RmaModel from "../../models/rma/rmaModel"
import auth, { Roles } from "../../middlewares/auth"
import validators from "./validators"
import checkIfTicketExists from "../../helpers/checkIfTicketExists"
import { MysqlError, OkPacket } from "mysql"
import { CommentRow } from "../../types/rma/rmaTypes"

class RmaCommentsController {
  public path = "/rma/comment"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.createComment
    )

    this.router.get(
      `${this.path}/:ticketId`,
      auth(Roles["RmaCommon"]),
      this.getComments
    )
  }

  private Model = new RmaModel()

  createComment = (
    req: Request<{ ticketId: string }, {}, { comment: string }>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    const { error } = validators.postComment.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    checkIfTicketExists(Number(req.params.ticketId))
      .then((rows) => {
        if (rows.length === 0) {
          return throwGenericError(res, 404, "Brak zlecenia o podanym ID")
        }

        this.Model.addComment(
          Number(req.params.ticketId),
          req.body.comment,
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

  getComments = (req: Request<{ ticketId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.ticketId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola ticketId")
    }

    this.Model.getComments(
      Number(req.params.ticketId),
      (err: MysqlError, rows: CommentRow[]) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json(rows)
      }
    )
  }
}

export default RmaCommentsController
