import mysql from "mysql2/promise"
import dbConfig from "../config/db.config"
import { ResultSetHeader, RowDataPacket } from "mysql2"

export const connection = mysql.createPool({
  connectionLimit: 10,
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  multipleStatements: true,
})

const query = async (
  conn: mysql.PoolConnection,
  sql: string,
  params?: any[]
) => {
  try {
    const result = await conn.query<ResultSetHeader | RowDataPacket[]>(
      sql,
      params
    )
    // await conn.commit()
    return result[0]
  } catch (error) {
    throw error
  }
}

export default query
