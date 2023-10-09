import formatDate from "../../../../../utils/formatDate"
import findSupplier from "../../../../helpers/findSupplier"
import {
  find_reqQuery,
  itemData,
  orderData,
} from "../../../../types/warehouse/spareparts/sparepartsTypes"
import db from "../../../db"
import { MysqlError, OkPacket } from "mysql"

class sparePartsOrdersModel {
  createOrder(supplier_id: number, exp_date: string, result: Function) {
    findSupplier(supplier_id)
      .then((rows: any) => {
        if (rows.length === 0) return result("404", null)

        const sql = `INSERT INTO spareparts_orders 
        (expected_date, supplier_id, status) 
        VALUES (${db.escape(exp_date)}, ${db.escape(supplier_id)},0)`

        console.log(sql)

        db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
          if (err) return result(err.code, null)
          return result(null, dbResult)
        })
      })
      .catch((err: MysqlError) => {
        return result(err.code, null)
      })
  }

  changeOrderStatus(order_id: number, status: number, result: Function) {
    const sql = `UPDATE spareparts_orders SET status = ${db.escape(
      status
    )} WHERE part_order_id = ${db.escape(order_id)}`

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }

  checkOrderStatus(order_id: number) {
    return new Promise(function (resolve, reject) {
      const sql = `select part_order_id, status from spareparts_orders where part_order_id = ${db.escape(
        order_id
      )}`
      db.query(sql, (err, rows) => {
        if (err) return reject(err)
        return resolve(rows)
      })
    })
  }

  editOrder(items: itemData[], orderData: orderData, result: Function) {
    let badOrder = false
    this.checkOrderStatus(orderData.part_order_id)
      .then((rows: any) => {
        if (rows.length === 0) {
          badOrder = true
          return Promise.reject(404)
        }

        if (rows[0].status === 2) {
          badOrder = true
          return Promise.reject(400)
        }

        let date = formatDate(orderData.expected_date)
        let sql = `update spareparts_orders set expected_date = ?, status = ?, supplier_id = ? where part_order_id = ?`
        let data = [
          date,
          orderData.status,
          orderData.supplier_id,
          orderData.part_order_id,
        ]

        db.query(sql, data, (err, dbResult) => {
          if (err) return Promise.reject(err)
          Promise.resolve()
        })
      })
      .then(function () {
        if (badOrder) return

        let queries = ""

        items.forEach((item: itemData) => {
          if (item.order_item_id === undefined || !item.order_item_id) {
            queries += `INSERT INTO spareparts_orders_items (part_cat_id, amount, order_id) VALUES (${db.escape(
              item.part_cat_id
            )}, ${db.escape(item.amount)}, ${db.escape(
              orderData.part_order_id
            )});`
          } else if (item.toRemove !== undefined || item.toRemove) {
            queries += `DELETE FROM spareparts_sn WHERE item_id = ${db.escape(
              item.order_item_id
            )};`
            queries += `DELETE FROM spareparts_orders_items WHERE order_item_id = ${db.escape(
              item.order_item_id
            )};`
          } else {
            queries += `UPDATE spareparts_orders_items set part_cat_id = ${db.escape(
              item.part_cat_id
            )}, amount = ${db.escape(
              item.amount
            )} WHERE order_item_id = ${db.escape(item.order_item_id)};`
          }

          db.query(queries, function (err, dbResult) {
            if (err) return result(err.code, null)
            return result(null, "ok")
          })
        })
      })
      .catch((err) => result(err, null))
  }

  findOrder(params: find_reqQuery, result: Function) {
    let sql = `select distinct so.part_order_id, so.expected_date, so.status, so.supplier_id
    from spareparts_orders so left join spareparts_orders_items soi on so.part_order_id = soi.order_id where`

    if (params.partCatId) {
      sql += ` soi.part_cat_id = ${db.escape(params.partCatId)}`
    }

    if (params.expDate) {
      if (params.partCatId) sql += ` AND`
      sql += ` so.expected_date = ${db.escape(params.expDate)}`
    }

    if (params.status) {
      if (params.partCatId || params.expDate) sql += ` AND`
      sql += ` so.status = ${db.escape(params.status)}`
    }

    db.query(sql, (err: MysqlError, rows: orderData) => {
      if (err) {
        return result(err, null)
      }
      return result(null, rows)
    })
  }
}

export default sparePartsOrdersModel
