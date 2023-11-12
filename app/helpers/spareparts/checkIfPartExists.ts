import { MysqlError } from "mysql"
import db from "../../models/db"

export default (code: string): Promise<{ codes: string }[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT codes FROM spareparts_sn WHERE codes=${db.escape(
      code
    )};`

    db.query(sql, (err: MysqlError, rows: { codes: string }[]) => {
      if (err) {
        return reject(err)
      }

      return resolve(rows)
    })
  })
}
