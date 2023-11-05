import db from "../models/db"
import { MysqlError } from "mysql"

export default (id: number): Promise<number[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT id FROM waybills WHERE id = ${db.escape(id)}`

    db.query(sql, (err: MysqlError, rows: number[]) => {
      if (err) {
        return reject(err)
      }
      return resolve(rows)
    })
  })
}
