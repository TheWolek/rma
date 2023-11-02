import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import AuthModel from "../../models/auth/authModel"
import { loginData, registerAccount } from "../../types/auth/authTypes"
import validators from "./validators"
import auth, { Roles } from "../../middlewares/auth"

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

  createNewAccount = (req: Request<{}, {}, registerAccount>, res: Response) => {
    const { error } = validators.createAccount.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.createAccount(
      req.body,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({
          userId: dbResult.insertId,
        })
      }
    )
  }

  login = (req: Request<{}, {}, loginData>, res: Response) => {
    const { error } = validators.login.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.login(req.body, (err: MysqlError | string, JWT: string) => {
      if (err) {
        if (String(err).includes("Błędne")) {
          return throwGenericError(res, 400, err)
        }
        return throwGenericError(res, 500, err, err)
      }

      if (!JWT) {
        return throwGenericError(res, 400, "Błędne hasło lub email")
      }

      res.status(200).json({
        token: JWT,
      })
    })
  }
}

export default AuthController
