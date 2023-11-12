import db from "../../models/db"

export default function (sn: string) {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT s.part_id, s.amount, ss.codes from spareparts s
        join spareparts_sn ss on s.part_id = ss.part_id where ss.codes = ${db.escape(
          sn
        )} and ss.isUsed = 0;`

    db.query(sql, function (err, rows) {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}
