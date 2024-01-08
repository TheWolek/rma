import db from "../../db"
import mysql from "mysql2/promise"
import { ResultSetHeader } from "mysql2/promise"
import query from "../../dbProm"
import { Shelve } from "../../../types/warehouse/shelvesTypes"

class shelvesModel {
  addNew = async (conn: mysql.PoolConnection, code: string) => {
    const sql = `INSERT INTO shelves (code) VALUES (${db.escape(code)})`

    try {
      const dbResult = await query(conn, sql)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }
  getAll = async (conn: mysql.PoolConnection) => {
    const sql = `SELECT shelve_id, code FROM shelves`

    try {
      const rows = await query(conn, sql)
      return rows as Shelve[]
    } catch (error) {
      throw error
    }
  }
}

export default shelvesModel
