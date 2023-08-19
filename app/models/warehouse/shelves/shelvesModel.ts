import db from "../../db"
import { MysqlError, OkPacket } from "mysql"

class shelvesModel {
  addNew(code: string, result: Function) {
    const sql = `INSERT INTO shelves (code) VALUES (${db.escape(code)})`
    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }
  getAll(result: Function) {
    const sql = `SELECT shelve_id, code FROM shelves`
    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }
}

export default shelvesModel
