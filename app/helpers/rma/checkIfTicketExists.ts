import { MysqlError } from "mysql"
import db from "../../models/db"

export default (ticketId: number): Promise<number[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT ticket_id FROM tickets WHERE ticket_id = ${db.escape(
      ticketId
    )}`

    db.query(sql, (err: MysqlError, rows: number[]) => {
      if (err) {
        return reject(err)
      }

      return resolve(rows)
    })
  })
}
