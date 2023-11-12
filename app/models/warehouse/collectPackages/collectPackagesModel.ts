import {
  CollectDetailsRow,
  CollectItemRow,
  CollectFilters,
  CollectTicketRow,
} from "../../../types/warehouse/collectPackages/collectPackages"
import db from "../../db"
import { MysqlError, OkPacket } from "mysql"

class CollectPackagesModel {
  create = (refName: string, result: Function) => {
    const sql = `INSERT INTO packageCollect (ref_name, status) VALUES (${db.escape(
      refName
    )}, 1)`

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  find = (filters: CollectFilters, result: Function) => {
    const queryFilters: string[] = []
    const params = []

    if (filters.refName) {
      queryFilters.push("ref_name like ?")
      params.push(`%${filters.refName}%`)
    }

    if (filters.created) {
      queryFilters.push("created = ?")
      params.push(filters.created)
    }

    const sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name AS 'status' 
    FROM packageCollect pc JOIN packageCollect_statuses pcs ON pc.status = pcs.id
    WHERE 1=1 ${queryFilters.length > 0 ? "AND" : ""} ${queryFilters.join(
      " AND "
    )} ORDER BY created DESC`

    db.query(sql, params, (err, rows) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  findOne = (id: number, result: Function) => {
    const sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name AS 'status', pci.waybill, pci.ticket_id, 
        CONCAT(t.ticket_id, '-', t.device_producer, '-', t.device_cat) AS 'barcode'
      FROM packageCollect pc 
      JOIN packageCollect_statuses pcs ON pc.status = pcs.id
      LEFT JOIN packageCollect_items pci ON pc.id = pci.collect_id
      LEFT JOIN tickets t ON pci.ticket_id = t.ticket_id
      WHERE pc.id = ${db.escape(id)}`

    db.query(sql, (err: MysqlError, rows: CollectDetailsRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  addItem = (collectId: number, waybill: string, result: Function) => {
    const sql_select = `SELECT t.ticket_id, concat(t.ticket_id, '-', t.device_producer, '-', t.device_cat) as 'barcode', w.waybill_number 
    from waybills w join tickets t on t.ticket_id = w.ticket_id where w.waybill_number = ${db.escape(
      waybill
    )} and w.type = 'przychodzący' and w.status = 'potwierdzony';`

    db.query(sql_select, (err: MysqlError, rows: CollectTicketRow[]) => {
      if (err) {
        return result(err)
      }

      if (rows.length === 0) {
        return result("Nie znaleziono zgłoszenia z podanym listem przewozoym")
      }

      const sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id) VALUES (${db.escape(
        collectId
      )}, ${db.escape(waybill)}, ${db.escape(rows[0].ticket_id)})`

      db.query(sql_insert, (err: MysqlError) => {
        if (err) {
          return result(err)
        }

        return result(null, rows[0])
      })
    })
  }

  editItems = (
    collectId: number,
    items: CollectItemRow[],
    result: Function
  ) => {
    const sql_delete = `DELETE FROM packageCollect_items WHERE collect_id = ${db.escape(
      collectId
    )};`
    const sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id) VALUES `
    const sql_select = `SELECT waybill FROM packageCollect_items WHERE collect_id = ${db.escape(
      collectId
    )};`
    const placeholders: string[] = []
    const params = []
    let sql = ""

    if (items.length > 0) {
      items.forEach((el, index) => {
        placeholders.push("(?,?,?)")
        params.push(collectId)
        params.push(el.waybill)
        params.push(el.ticket_id)
      })

      sql = sql_delete + sql_insert + ";"
    } else {
      sql = sql_delete
    }

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      db.query(sql_select, (err: MysqlError, rows: { waybill: string }[]) => {
        if (err) {
          return result(err, null)
        }

        return result(
          null,
          rows.map((item) => item.waybill)
        )
      })
    })
  }
}

export default CollectPackagesModel
