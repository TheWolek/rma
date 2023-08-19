import db from "../../db"
import { MysqlError, OkPacket } from "mysql"
import { newItemData } from "../../../types/warehouse/items/itemsTypes"

class warehouseItemsModel {
  createNewItem(item: newItemData, result: Function) {
    let sql = `INSERT INTO items (name, category, ticket_id, shelve, sn) 
    VALUES (
    ?, ?, ?, 0, ?
    ); UPDATE tickets SET inWarehouse = 1 WHERE ticket_id = ?`
    let data = [
      item.producer,
      item.category,
      item.ticket_id,
      item.sn,
      item.ticket_id,
    ]

    db.query(sql, data, (err, dbResult) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          return result(err.code, null)
        }
        return result(err, null)
      }
      result(null, dbResult)
    })
  }

  checkIfItemExists(ticket_id: number, result: Function) {
    let sql = `SELECT item_id FROM items WHERE ticket_id = ${db.escape(
      ticket_id
    )}`
    db.query(sql, (err, rows) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  findItems(result: Function, ticket_id?: number, shelve_id?: number) {
    let sql = `SELECT item_id, name, shelve, category, ticket_id, sn FROM items`
    if (ticket_id) {
      sql += ` WHERE ticket_id = ${db.escape(ticket_id)}`
    }

    if (shelve_id) {
      sql += ` WHERE shelve = ${db.escape(shelve_id)}`
    }

    db.query(sql, (err, rows) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  countAllItems(result: Function) {
    const sql = `SELECT count(*) as 'count' FROM items`

    db.query(sql, (err, rows) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  changeShelve(
    destination: number,
    current: number,
    tickets_ids: number[],
    result: Function
  ) {
    let ticket_id_placeholder = tickets_ids.map((el) => "?")
    let sql = `UPDATE items SET shelve = ? 
    WHERE shelve = ? AND ticket_id in (${ticket_id_placeholder.join(",")})`
    let data = [destination, current, ...tickets_ids]

    db.query(sql, data, (err, dbResult) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }

  deleteItem(ticket_id: number, shelve: number, result: Function) {
    const sql = `DELETE FROM items WHERE ticket_id = ${db.escape(
      ticket_id
    )} AND shelve = ${db.escape(shelve)}`

    db.query(sql, (err, dbResult) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }
}

export default warehouseItemsModel
