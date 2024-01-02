import db from "../../models/db"

export interface RegisterItem {
  ticket_id: number
  barcode: string
  device_producer: string
  device_cat: string
  device_sn: string
}

export default (item: RegisterItem) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO items (name, category, ticket_id, shelve, sn, barcode) VALUES (
        ?, ?, ?, 0, ?, ?
    ); UPDATE tickets SET inWarehouse = 1 WHERE ticket_id = ?`
    const data = [
      item.device_producer,
      item.device_cat,
      item.ticket_id,
      item.device_sn,
      item.barcode,
      item.ticket_id,
    ]

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
