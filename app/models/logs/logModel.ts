import query, { connection } from "../dbProm"
import mysql from "mysql2/promise"
import { LogRow } from "./constants"

export interface LogData {
  action: string
  log: string
  user_id: number
  ticketId: number
}

class LogModel {
  log = async (conn: mysql.PoolConnection, logData: LogData) => {
    return await query(
      conn,
      `INSERT INTO tickets_logs (action, log, user_id, ticket_id) VALUES (?,?,?,?)`,
      [logData.action, logData.log, logData.user_id, logData.ticketId]
    )
  }

  getLogs = async (ticketId: number) => {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    const response = await query(
      conn,
      `SELECT tl.log_id, tl.created, tl.action, tl.log, u.login, tl.ticket_id FROM tickets_logs tl JOIN users u ON tl.user_id = u.user_id WHERE ticket_id = ${ticketId} ORDER BY tl.created ASC`
    )

    conn.release()
    return response as LogRow[]
  }
}

export default LogModel
