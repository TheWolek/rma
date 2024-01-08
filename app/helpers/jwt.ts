import jwt, { Secret } from "jsonwebtoken"
import dotenv from "dotenv"
import db from "../models/db"
import { MysqlError } from "mysql"

dotenv.config()
const secret: Secret = process.env.JWT_secret || "932137128937127378917289"

declare module "jsonwebtoken" {
  export interface UserIdJwtPayload extends jwt.JwtPayload {
    userId: number
    userRole: string
  }
}

export interface userData {
  userId: number
  userRole: string
  rolesArray: string[]
}

function getUserRole(userId: number, result: Function) {
  const sql = `SELECT role FROM user_roles WHERE user_id = ${db.escape(userId)}`

  db.query(sql, (err: MysqlError, rows: { role: string }[]) => {
    if (err) return result(err, null)
    if (rows.length === 0) return result("404", null)

    return result(null, rows)
  })
}

export const getUserId = (token: string) => {
  const { userId } = <jwt.UserIdJwtPayload>jwt.verify(token, secret)
  return userId
}

export const generateToken = (userId: number, role: string): string => {
  const expTime = "1h"

  const payload = {
    userId: userId,
    userRole: role,
  }

  const token = jwt.sign(payload, secret, { expiresIn: expTime })

  return token
}

export const verifyJWT = (token: string, result: Function) => {
  try {
    const { userId, userRole } = <jwt.UserIdJwtPayload>jwt.verify(token, secret)
    getUserRole(
      userId,
      (err: MysqlError | string, roles: { role: string }[]) => {
        if (err) return result(err)
        let rolesArray = roles.map((role) => role.role)

        return result(null, { userId, userRole, rolesArray })
      }
    )
  } catch (error) {
    return result(error)
  }
}
