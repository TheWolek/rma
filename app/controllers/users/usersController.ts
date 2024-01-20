import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { connection } from "../../models/dbProm"
import { getUserId } from "../../helpers/jwt"
import auth, { Roles } from "../../middlewares/auth"
import AuthModel from "../../models/auth/authModel"
import { EditUserReqBody } from "../../types/auth/authTypes"
import validators from "./validators"

class UsersController {
  public path = "/users"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(`${this.path}`, auth(Roles.Admin), this.getUsers)

    this.router.get(`${this.path}/:userId`, auth(Roles.Admin), this.getUser)

    this.router.delete(
      `${this.path}/:userId`,
      auth(Roles.Admin),
      this.deleteUser
    )

    this.router.put(`${this.path}/:userId`, auth(Roles.Admin), this.editUser)
  }

  private Model = new AuthModel()

  getUsers = async (
    req: Request<{}, {}, {}, { login: string }>,
    res: Response
  ) => {
    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.Model.getUsers(conn, req.query.login)
      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  getUser = async (req: Request<{ userId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.userId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola userId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const row = await this.Model.getUser(conn, Number(req.params.userId))
      return res.status(200).json(row)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  deleteUser = async (req: Request<{ userId: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.userId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola userId")
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const admin_id = getUserId(
        String(req.headers.authorization?.split(" ")[1])
      )

      await this.Model.deleteUser(conn, {
        user_id: parseInt(req.params.userId),
        admin_id: admin_id,
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

  editUser = async (
    req: Request<{ userId: string }, {}, EditUserReqBody>,
    res: Response
  ) => {
    if (isNaN(parseInt(req.params.userId))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola userId")
    }

    const { error } = validators.editUser.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0]?.message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      await this.Model.editUser(conn, {
        ...req.body,
        user_id: Number(req.params.userId),
      })
      return res.status(200).json({})
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default UsersController
