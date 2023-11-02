import db from "../db"
import { MysqlError, OkPacket } from "mysql"
import {
  loginData,
  registerAccount,
  userLoginData,
} from "../../types/auth/authTypes"
import bycrypt from "bcryptjs"
import { generateToken } from "../../helpers/jwt"

class AuthModel {
  createAccount(registerData: registerAccount, result: Function) {
    this.checkIfUserExists(registerData.login)
      .then(async () => {
        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(registerData.password, salt)

        this.createUser(registerData.login, hashedPassword)
          .then((createRes) => {
            let role_sql = `INSERT INTO user_roles (user_id, role) values`
            let values: any[] = []

            registerData.roles.forEach((el, index) => {
              if (index > 0) {
                role_sql += ","
              }
              role_sql += `(?,?)`
              values.push(createRes.insertId, el)
            })

            if (values.length === 0) {
              return result("brak danych", null)
            }

            db.query(role_sql, values, (err, dbResult) => {
              if (err) {
                return result(err, null)
              }

              return result(null, dbResult)
            })
          })
          .catch((err) => result(err, null))
      })
      .catch((err) => result(err, null))
  }

  private checkIfUserExists = (login: string) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT login FROM users WHERE login = ${db.escape(login)}`

      db.query(sql, (err: MysqlError, rows: { login: string }[]) => {
        if (err) return reject(err)
        if (rows.length > 0) return reject("Podany login jest już zajęty")
        resolve(rows)
      })
    })
  }

  private createUser = (login: string, password: string): Promise<OkPacket> => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (login, password) VALUES (${db.escape(
        login
      )}, ${db.escape(password)})`

      db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
        if (err) return reject(err)
        resolve(dbResult)
      })
    })
  }

  login(loginData: loginData, result: Function) {
    const sql = `SELECT user_id, login, password FROM users WHERE login = ${db.escape(
      loginData.login
    )}`

    db.query(sql, async (err: MysqlError, rows: userLoginData[]) => {
      if (err) return result(err, null)
      if (rows.length === 0) return result("Błędne hasło lub login", null)

      const isPasswordValid = await bycrypt.compare(
        loginData.password,
        rows[0].password
      )

      if (isPasswordValid) {
        this.logLastLogin(rows[0].user_id)
        return result(null, generateToken(rows[0].user_id))
      } else {
        return result("Błędne hasło lub login", null)
      }
    })
  }

  private logLastLogin(userId: number) {
    const sql = `UPDATE users SET last_login_date = NOW() WHERE user_id = ${db.escape(
      userId
    )};`

    db.query(sql, () => null)
  }
}

export default AuthModel
