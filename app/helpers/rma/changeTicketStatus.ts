import db from "../../models/db"

export default (ticket_id: number, newStatus: number) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tickets SET status = ?, lastStatusUpdate = NOW() WHERE ticket_id = ?`
    const params = [newStatus, ticket_id]

    db.query(sql, params, (err) => {
      if (err) reject([500, err])
      resolve(true)
    })
  })
}
