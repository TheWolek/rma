import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import AuthModel from "../../models/auth/authModel"
import { loginData, registerAccount } from "../../types/auth/authTypes"
import validators from "./validators"
import auth, { Roles } from "../../middlewares/auth"
import { connection } from "../../models/dbProm"
import { ResultSetHeader } from "mysql2"

class AuthController {
  public path = "/auth"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/register`,
      auth(Roles.Admin),
      this.createNewAccount
    )
    this.router.post(`${this.path}/login`, this.login)
  }

  private Model = new AuthModel()

  createNewAccount = async (
    req: Request<{}, {}, registerAccount>,
    res: Response
  ) => {
    const { error } = validators.createAccount.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const dbResult = (await this.Model.createAccount(
        conn,
        req.body
      )) as ResultSetHeader

      return res.status(200).json({
        userId: dbResult.insertId,
      })
    } catch (error) {
      if (typeof error === "string") {
        return throwGenericError(res, 400, error)
      }
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  login = async (req: Request<{}, {}, loginData>, res: Response) => {
    const { error } = validators.login.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const JWT = await this.Model.login(conn, req.body)

      if (!JWT) {
        return throwGenericError(res, 400, "Błędne hasło lub email")
      }

      return res.status(200).json({
        token: JWT,
      })
    } catch (error) {
      if (typeof error === "string") {
        return throwGenericError(res, 400, error)
      }

      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default AuthController
