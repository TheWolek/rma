import { checkIfWaybillNumberExists } from "./checkIfWaybillExists"
import db from "../../models/db"

export default (waybill: string, newStatus: string) => {
  return checkIfWaybillNumberExists(waybill)
    .then((rows) => {
      return new Promise(function (resolve, reject) {
        if (rows.length === 0) {
          return reject([404, `Brak listu o podanym ID - ${waybill}`])
        }

        const sql = `UPDATE waybills SET status = ?, lastUpdate = NOW() WHERE waybill_number = ?;`
        const params = [newStatus, waybill]

        db.query(sql, params, (err) => {
          if (err) {
            return reject(err)
          }
          resolve(true)
        })
      })
    })
    .catch()
}
