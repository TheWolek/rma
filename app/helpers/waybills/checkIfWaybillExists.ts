import db from "../../models/db"
import { MysqlError } from "mysql"
import { CheckWaybillRow } from "../../types/warehouse/waybills"

export const checkIfWaybillNumberExists = (
  waybill: string
): Promise<CheckWaybillRow[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT id, waybill_number FROM waybills WHERE waybill_number=${db.escape(
      waybill
    )} and status = 'potwierdzony';`

    db.query(sql, (err: MysqlError, rows: CheckWaybillRow[]) => {
      if (err) {
        return reject(err)
      }
      return resolve(rows)
    })
  })
}

export const checkIfWaybillExists = (
  waybillId: number
): Promise<{ id: number }[]> => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id FROM waybills WHERE id = ${db.escape(waybillId)}`
    db.query(sql, (err: MysqlError, rows: { id: number }[]) => {
      if (err) {
        return reject(err)
      }
      return resolve(rows)
    })
  })
}
