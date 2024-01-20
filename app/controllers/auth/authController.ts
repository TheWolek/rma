import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import AuthModel from "../../models/auth/authModel"
import {
  ChangePasswordData,
  LoginData,
  RegisterAccount,
} from "../../types/auth/authTypes"
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

    this.router.put(`${this.path}/changePassword`, this.changePassword)
  }

  private Model = new AuthModel()

  createNewAccount = async (
    req: Request<{}, {}, RegisterAccount>,
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

      conn.commit()

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

  login = async (req: Request<{}, {}, LoginData>, res: Response) => {
    const { error } = validators.login.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const loginRes = await this.Model.login(conn, req.body)

      if (!loginRes) {
        return throwGenericError(res, 400, "Błędne hasło lub email")
      }

      conn.commit()

      return res.status(200).json({
        token: loginRes,
      })
    } catch (error) {
      if (typeof error === "string") {
        if (error === "CHANGE_PASSWORD") {
          return throwGenericError(res, 401, "Zmień pierwsze hasło")
        }
        return throwGenericError(res, 400, error)
      }

      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  changePassword = async (
    req: Request<{}, {}, ChangePasswordData>,
    res: Response
  ) => {
    const { error } = validators.changePassword.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      await this.Model.changePassword(conn, req.body)

      const loginRes = await this.Model.login(conn, {
        login: req.body.login,
        password: req.body.newPassword,
      })

      if (!loginRes) {
        return throwGenericError(res, 400, "Błędne hasło lub email")
      }

      conn.commit()

      return res.status(200).json({
        token: loginRes,
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
