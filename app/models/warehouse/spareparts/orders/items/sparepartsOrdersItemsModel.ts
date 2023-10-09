import {
  orderItem,
  parsedOrderItem,
  addPart,
  removePart,
  setCodesItem,
} from "../../../../../types/warehouse/spareparts/sparepartsTypes"
import db from "../../../../db"
import { MysqlError, OkPacket } from "mysql"

interface catData {
  name: string
}

interface orderData {
  part_order_id: number
}

class sparepartsOrdersItemsModel {
  getItems(orderId: number, result: Function) {
    let sql = `select soi.order_item_id, soi.part_cat_id, soi.amount, sois.codes 
  from spareparts_orders_items soi left join spareparts_sn sois on soi.order_item_id = sois.item_id
  where soi.order_id =${db.escape(orderId)}`

    db.query(sql, (err: MysqlError, rows: orderItem[]) => {
      if (err) {
        return result(err, null)
      }

      let output: parsedOrderItem[] = []

      rows.forEach((el) => {
        let findItem = output.find((o) => o.order_item_id === el.order_item_id)

        if (findItem !== undefined) {
          findItem.codes.push(el.codes)
        } else {
          output.push({
            order_item_id: el.order_item_id,
            part_cat_id: el.part_cat_id,
            amount: el.amount,
            codes: [el.codes],
          })
        }
      })

      return result(null, output)
    })
  }

  private findCategory(category_id: number): Promise<catData[]> {
    return new Promise((resolve, reject) => {
      const sql_findCategory = `SELECT name FROM spareparts_cat WHERE part_cat_id = ${db.escape(
        category_id
      )}`

      db.query(sql_findCategory, (err: MysqlError, rows: catData[]) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  private findOrder(order_id: number): Promise<orderData[]> {
    return new Promise((resolve, reject) => {
      const sql_findOrder = `SELECT part_order_id FROM spareparts_orders WHERE part_order_id = ${db.escape(
        order_id
      )}`

      db.query(sql_findOrder, (err: MysqlError, rows: orderData[]) => {
        if (err) {
          return reject(err)
        }
        resolve(rows)
      })
    })
  }

  addItems(params: addPart, result: Function) {
    const sql_insertOrderItem = `INSERT INTO spareparts_orders_items (order_id, part_cat_id, amount) VALUES (?,?,?)`
    const values = [params.order_id, params.part_cat_id, params.amount]
    this.findCategory(params.part_cat_id)
      .then((catData: catData[]) => {
        if (catData.length === 0) {
          return result("Wpisana kategoria nie istnieje", null)
        }

        this.findOrder(params.order_id)
          .then((orderData: orderData[]) => {
            if (orderData.length === 0) {
              return result("Wpisane zamówienie nie istnieje", null)
            }

            db.query(sql_insertOrderItem, values, (err, dbResult) => {
              if (err) {
                return result(err, null)
              }

              return result(null, dbResult)
            })
          })
          .catch((err) => result(err, null))
      })
      .catch((err) => result(err, null))
  }

  removeItems(toDel: number[], result: Function) {
    const placeholders = toDel.map(() => "?")
    const values = toDel

    const sql = `DELETE FROM spareparts_orders_items WHERE order_item_id in (${placeholders.join(
      ","
    )})`

    db.query(sql, values, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  setCodes(items: setCodesItem[], result: Function) {
    let sql = `INSERT INTO spareparts_sn (codes, item_id, part_id, shelve) values `
    let values: any[] = []
    items.forEach((el) => {
      for (let i = 0; i < el.codes.length; i++) {
        if (i > 0) {
          sql += ","
        }
        sql += `(?,?,?,?)`
        values.push(el.codes[i], el.item_id, el.part_id, 0)
      }
    })

    if (values.length === 0) {
      return result("brak danych", null)
    }

    db.query(sql, values, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }
}

export default sparepartsOrdersItemsModel
