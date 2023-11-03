import db from "../db"
import { MysqlError, OkPacket } from "mysql"
import { DictTable, DictRow, DictType } from "../../types/rma/dictionariesTypes"

class DictionariesModel {
  getDict = (table: DictTable, result: Function) => {
    const sql = `SELECT * FROM ${table}`
    db.query(sql, (err: MysqlError, rows: DictRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  editDict = (table: DictType, data: DictRow, result: Function) => {
    const sql = `UPDATE ${table} SET name = ${db.escape(
      data.name
    )} WHERE id = ${db.escape(data.id)}`

    db.query(sql, (err: MysqlError, dbRes: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbRes)
    })
  }
}

export default DictionariesModel
