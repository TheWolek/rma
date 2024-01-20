import db from "../db"
import {
  BlockUserData,
  ChangePasswordData,
  EditUserData,
  LoginData,
  RegisterAccount,
  User,
  UserLoginData,
} from "../../types/auth/authTypes"
import bycrypt from "bcryptjs"
import { generateToken } from "../../helpers/jwt"
import mysql, { ResultSetHeader } from "mysql2/promise"
import query from "../dbProm"

class AuthModel {
  createAccount = async (
    conn: mysql.PoolConnection,
    registerData: RegisterAccount
  ) => {
    try {
      const user = await this.checkIfUserExists(conn, registerData.login)
      const hashedPassword = await this.hashPassword(registerData.password)

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

  private SQL_SELECT_USER = `SELECT u.user_id, u.login, u.password, ur.role, u.change_password FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.deleted = 0 AND u.login =`

  private hashPassword = async (password: string) => {
    const salt = await bycrypt.genSalt(10)
    return await bycrypt.hash(password, salt)
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
      const sql = `INSERT INTO users (login, password, change_password) VALUES (${db.escape(
        login
      )}, ${db.escape(password)}, 1)`

      try {
        const dbResult = (await query(conn, sql)) as ResultSetHeader
        return resolve(dbResult)
      } catch (error) {
        throw error
      }
    })
  }

  login = async (conn: mysql.PoolConnection, loginData: LoginData) => {
    const sql = `${this.SQL_SELECT_USER} ${db.escape(loginData.login)}`

    try {
      const rows = (await query(conn, sql)) as UserLoginData[]

      if (rows.length === 0) {
        throw "Błędne hasło lub login"
      }

      const isPasswordValid = await bycrypt.compare(
        loginData.password,
        rows[0].password
      )

      if (!isPasswordValid) {
        throw "Błędne hasło lub login"
      }

      if (rows[0].change_password === 1) {
        throw "CHANGE_PASSWORD"
      }

      this.logLastLogin(conn, rows[0].user_id)
      return generateToken(rows[0].user_id, rows[0].login, rows[0].role)
    } catch (error) {
      throw error
    }
  }

  changePassword = async (
    conn: mysql.PoolConnection,
    data: ChangePasswordData
  ) => {
    try {
      const sql = `${this.SQL_SELECT_USER} ${db.escape(data.login)}`

      const rows = (await query(conn, sql)) as UserLoginData[]

      if (rows.length === 0) {
        throw "Błędne hasło lub login"
      }

      const isPasswordValid = await bycrypt.compare(
        data.password,
        rows[0].password
      )

      if (!isPasswordValid) {
        throw "Błędne hasło lub login"
      }

      if (rows[0].change_password === 0) {
        throw "Konto nie wymaga zmiany hasła"
      }

      const hashedPassword = await this.hashPassword(data.newPassword)

      const update_sql = `UPDATE users SET password = ${db.escape(
        hashedPassword
      )}, change_password = 0 WHERE user_id = ${rows[0].user_id}`

      await query(conn, update_sql)
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

  deleteUser = async (conn: mysql.PoolConnection, data: BlockUserData) => {
    const sql = `UPDATE users SET deleted = 1, deleted_at = NOW(), deleted_by = ${db.escape(
      data.admin_id
    )} WHERE user_id = ${db.escape(data.user_id)}`

    try {
      const dbResult = await query(conn, sql)
    } catch (error) {
      throw error
    }
  }

  getUsers = async (conn: mysql.PoolConnection, login?: string) => {
    let sql = `SELECT u.user_id, u.login, u.created_date, u.last_login_date, u.change_password, ur.role FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.deleted = 0`

    if (login) {
      sql += ` AND u.login = '${login}'`
    }

    try {
      const rows = (await query(conn, sql)) as User[]
      const parseBool = (num: number) => num === 1
      const parsed = rows.map((user) => ({
        ...user,
        change_password: parseBool(Number(user.change_password)),
      }))
      return parsed
    } catch (error) {
      throw error
    }
  }

  getUser = async (conn: mysql.PoolConnection, userId: number) => {
    let sql = `SELECT u.user_id, u.login, u.created_date, u.last_login_date, u.change_password, ur.role FROM users u JOIN user_roles ur ON u.user_id = ur.user_id WHERE u.deleted = 0 AND u.user_id = ${userId}`

    try {
      const rows = (await query(conn, sql)) as User[]
      rows[0].change_password = rows[0]?.change_password === 1
      return rows[0]
    } catch (error) {
      throw error
    }
  }

  editUser = async (conn: mysql.PoolConnection, editData: EditUserData) => {
    const changePasswordNum = editData.change_password ? 1 : 0
    const sqlUser = `UPDATE users SET change_password = ${changePasswordNum} WHERE user_id = ${db.escape(
      editData.user_id
    )}`
    const sqlUserRole = `UPDATE user_roles SET role = ${db.escape(
      editData.role
    )} WHERE user_id = ${db.escape(editData.user_id)}`

    try {
      await query(conn, sqlUser)
      await query(conn, sqlUserRole)
      return true
    } catch (error) {
      throw error
    }
  }
}

export default AuthModel
