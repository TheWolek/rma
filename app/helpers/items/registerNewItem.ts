import db from "../../models/db"

export default (
  ticket_id: number,
  producer: string,
  category: string,
  sn: string
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO items (name, category, ticket_id, shelve, sn) VALUES (
        ?, ?, ?, 0, ?
    ); UPDATE tickets SET inWarehouse = 1 WHERE ticket_id = ?`
    const data = [producer, category, ticket_id, sn, ticket_id]

    db.query(sql, data, (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY")
          return reject([
            400,
            {
              message: "produkt z podanym ticket id został już zarejestrowany",
            },
          ])
        reject([500, err])
      }
      resolve(result)
    })
  })
}
