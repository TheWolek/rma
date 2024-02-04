import mysql from "mysql2/promise"
import query from "../models/dbProm"

const pageSize = 4

export default async (
  conn: mysql.PoolConnection,
  tableName: string,
  condition: string,
  params: (string | number)[]
) => {
  const sql = `SELECT CEIL(COUNT(*) / ${pageSize}) AS pageCount FROM ${tableName} WHERE ${condition}`

  try {
    const result = (await query(conn, sql, params)) as { pageCount: string }[]
    return parseInt(result[0].pageCount)
  } catch (error) {
    throw error
  }
}
