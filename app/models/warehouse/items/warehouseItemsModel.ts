import db from "../../db"
import { MysqlError, OkPacket } from "mysql"
import { newItemData } from "../../../types/warehouse/items/itemsTypes"

class warehouseItemsModel {
  createNewItem(item: newItemData, result: Function) {
    let sql = `INSERT INTO items (name, category, ticket_id, barcode, shelve, sn) 
    VALUES (
    ?, ?, ?, ?, 0, ?
    ); UPDATE tickets SET inWarehouse = 1 WHERE ticket_id = ?`
    let data = [
      item.producer,
      item.category,
      item.ticket_id,
      item.barcode,
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

  checkIfItemExists(barcode: string, result: Function) {
    let sql = `SELECT item_id FROM items WHERE barcode = ${db.escape(barcode)}`
    db.query(sql, (err, rows) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  findItems(result: Function, barcode?: string, shelve_id?: number) {
    let sql = `SELECT i.item_id, i.name, i.shelve, i.category, i.ticket_id, i.barcode, i.sn, s.code as shelve_code FROM items i JOIN shelves s ON i.shelve = s.shelve_id`

    if (barcode || shelve_id) {
      sql += ` WHERE `
    }
    if (barcode) {
      sql += `barcode = ${db.escape(barcode)}`
    }

    if (shelve_id) {
      if (barcode) {
        sql += " AND "
      }
      sql += `shelve = ${db.escape(shelve_id)}`
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
    barcodes: string[],
    result: Function
  ) {
    let barcodes_placeholder = barcodes.map((el) => "?")
    let sql = `UPDATE items SET shelve = ? 
    WHERE shelve = ? AND barcode in (${barcodes_placeholder.join(",")})`
    let data = [destination, current, ...barcodes]

    console.log(sql, data)

    db.query(sql, data, (err, dbResult) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }

  deleteItem(barcode: string, shelve: number, result: Function) {
    const sql = `DELETE FROM items WHERE barcode = ${db.escape(
      barcode
    )} AND shelve = ${db.escape(shelve)}`

    db.query(sql, (err, dbResult) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }
}

export default warehouseItemsModel
