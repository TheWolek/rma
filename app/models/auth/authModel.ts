import db from "../db"
import {
  loginData,
  registerAccount,
  userLoginData,
} from "../../types/auth/authTypes"
import bycrypt from "bcryptjs"
import { generateToken } from "../../helpers/jwt"
import mysql, { ResultSetHeader } from "mysql2/promise"
import query from "../dbProm"

class AuthModel {
  createAccount = async (
    conn: mysql.PoolConnection,
    registerData: registerAccount
  ) => {
    try {
      const user = await this.checkIfUserExists(conn, registerData.login)

      const salt = await bycrypt.genSalt(10)
      const hashedPassword = await bycrypt.hash(registerData.password, salt)

      const createRes = await this.createUser(
        conn,
        registerData.login,
        hashedPassword
      )

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
        return "Brak danych"
      }

      const dbResult = await query(conn, role_sql, values)

      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  private checkIfUserExists = async (
    conn: mysql.PoolConnection,
    login: string
  ): Promise<{ login: string }[]> => {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT login FROM users WHERE login = ${db.escape(login)}`

      try {
        const rows = (await query(conn, sql)) as { login: string }[]

        if (rows.length > 0) {
          return reject("Podany login jest już zajęty")
        }

        resolve(rows)
      } catch (error) {
        throw error
      }
    })
  }

  private createUser = async (
    conn: mysql.PoolConnection,
    login: string,
    password: string
  ): Promise<ResultSetHeader> => {
    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO users (login, password) VALUES (${db.escape(
        login
      )}, ${db.escape(password)})`

      try {
        const dbResult = (await query(conn, sql)) as ResultSetHeader
        return resolve(dbResult)
      } catch (error) {
        throw error
      }
    })
  }

  login = async (conn: mysql.PoolConnection, loginData: loginData) => {
    const sql = `SELECT u.user_id, u.login, u.password, ur.role FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.login = ${db.escape(
      loginData.login
    )}`

    try {
      const rows = (await query(conn, sql)) as userLoginData[]

      if (rows.length === 0) {
        return "Błędne hasło lub login"
      }

      const isPasswordValid = await bycrypt.compare(
        loginData.password,
        rows[0].password
      )

      if (isPasswordValid) {
        this.logLastLogin(conn, rows[0].user_id)
        return generateToken(rows[0].user_id, rows[0].role)
      } else {
        return "Błędne hasło lub login"
      }
    } catch (error) {
      throw error
    }
  }

  private logLastLogin = async (conn: mysql.PoolConnection, userId: number) => {
    const sql = `UPDATE users SET last_login_date = NOW() WHERE user_id = ${db.escape(
      userId
    )};`

    try {
      await query(conn, sql)
      return
    } catch (error) {
      throw error
    }
  }
}

export default AuthModel
