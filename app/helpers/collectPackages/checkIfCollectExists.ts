import db from "../../models/db"
import { MysqlError } from "mysql"

export default (id: number): Promise<{ id: number; status: number }[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT id, status FROM packageCollect WHERE id = ${db.escape(
      id
    )}`

    db.query(
      sql,
      function (err: MysqlError, rows: { id: number; status: number }[]) {
        if (err) {
          return reject(err)
        }
        resolve(rows)
      }
    )
  })
}
