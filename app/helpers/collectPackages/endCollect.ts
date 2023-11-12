import db from "../../models/db"

export default (collect_id: number) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE packageCollect SET status = 2 WHERE id = ${db.escape(
      collect_id
    )};`

    db.query(sql, (err) => {
      if (err) reject([500, err])
      return resolve(true)
    })
  })
}
