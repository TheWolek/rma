import db from "../../models/db"

export default function (supplier_id: number) {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT name FROM suppliers WHERE id = ${db.escape(
      supplier_id
    )}`
    db.query(sql, (err, rows) => {
      if (err) return reject(err)
      return resolve(rows)
    })
  })
}
