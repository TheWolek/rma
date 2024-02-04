import {
  CollectDetailsRow,
  CollectItemRow,
  CollectFilters,
  CollectTicketRow,
  CollectRow,
} from "../../../types/warehouse/collectPackages/collectPackages"
import db from "../../db"
import mysql from "mysql2/promise"
import { ResultSetHeader } from "mysql2/promise"
import query from "../../dbProm"
import calculatePages from "../../../helpers/calculatePages"

class CollectPackagesModel {
  create = async (conn: mysql.PoolConnection, refName: string) => {
    const sql = `INSERT INTO packageCollect (ref_name, status) VALUES (${db.escape(
      refName
    )}, 1)`

    try {
      const dbResult = await query(conn, sql)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  find = async (conn: mysql.PoolConnection, filters: CollectFilters) => {
    const queryFilters: string[] = []
    const params = []

    if (filters.refName) {
      queryFilters.push("pc.ref_name like ?")
      params.push(`%${filters.refName}%`)
    }

    if (filters.created) {
      queryFilters.push("DATE(pc.created) = ?")
      params.push(filters.created)
    }

    if (filters.status) {
      queryFilters.push("pcs.name = ?")
      params.push(filters.status)
    }

    const condition = `${queryFilters.join(" AND ")}`
    const pageSize = 4
    let pageNumber = filters?.pageNumber || 1

    try {
      const pageCount = await calculatePages(
        conn,
        "packageCollect pc JOIN packageCollect_statuses pcs ON pc.status = pcs.id",
        `${condition.length > 0 ? "1=1 AND " : "1=1"} ${condition}`,
        params
      )

      if (filters.pageNumber < 1) {
        pageNumber = 1
      }

      if (filters.pageNumber > pageCount) {
        pageNumber = pageCount
      }

      const offset = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0

      const sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name AS 'status' 
      FROM packageCollect pc JOIN packageCollect_statuses pcs ON pc.status = pcs.id
      WHERE 1=1 ${
        queryFilters.length > 0 ? "AND" : ""
      } ${condition} ORDER BY created DESC LIMIT ${pageSize} OFFSET ${offset}`

      const rows = (await query(conn, sql, params)) as CollectRow[]
      return {
        items: rows,
        pageCount: pageCount,
        currentPage: pageNumber,
      }
    } catch (error) {
      throw error
    }
  }

  findOne = async (conn: mysql.PoolConnection, id: number) => {
    const sql = `SELECT pc.id, pc.ref_name, pc.created, pcs.name AS 'status', pci.waybill, pci.ticket_id, t.barcode
      FROM packageCollect pc 
      JOIN packageCollect_statuses pcs ON pc.status = pcs.id
      LEFT JOIN packageCollect_items pci ON pc.id = pci.collect_id
      LEFT JOIN tickets t ON pci.ticket_id = t.ticket_id
      WHERE pc.id = ${db.escape(id)}`

    try {
      const rows = await query(conn, sql)
      return rows as CollectDetailsRow[]
    } catch (error) {
      throw error
    }
  }

  addItem = async (
    conn: mysql.PoolConnection,
    collectId: number,
    waybill: string
  ) => {
    const sql_select = `SELECT t.ticket_id, t.barcode, w.waybill_number 
    from waybills w join tickets t on t.ticket_id = w.ticket_id where w.waybill_number = ${db.escape(
      waybill
    )} and w.type = 'przychodzący' and w.status = 'potwierdzony';`

    try {
      const rows = (await query(conn, sql_select)) as CollectTicketRow[]

      if (rows.length === 0) {
        return "Nie znaleziono zgłoszenia z podanym listem przewozoym"
      }

      const sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id, barcode) VALUES (${db.escape(
        collectId
      )}, ${db.escape(waybill)}, ${db.escape(rows[0].ticket_id)}, ${db.escape(
        rows[0].barcode
      )})`

      await query(conn, sql_insert)

      return rows[0]
    } catch (error) {
      throw error
    }
  }

  editItems = async (
    conn: mysql.PoolConnection,
    collectId: number,
    items: CollectItemRow[]
  ) => {
    const sql_delete = `DELETE FROM packageCollect_items WHERE collect_id = ${db.escape(
      collectId
    )};`
    const sql_insert = `INSERT INTO packageCollect_items (collect_id, waybill, ticket_id, barcode) VALUES `
    const sql_select = `SELECT waybill FROM packageCollect_items WHERE collect_id = ${db.escape(
      collectId
    )};`
    const placeholders: string[] = []
    const params = []
    let sql = ""

    if (items.length > 0) {
      items.forEach((el, index) => {
        placeholders.push("(?,?,?,?)")
        params.push(collectId)
        params.push(el.waybill)
        params.push(el.ticket_id)
        params.push(el.barcode)
      })

      sql = sql_delete + sql_insert + ";"
    } else {
      sql = sql_delete
    }

    try {
      await query(conn, sql)

      const rows = (await query(conn, sql_select)) as { waybill: string[] }[]

      return rows.map((item) => item.waybill)
    } catch (error) {
      throw error
    }
  }
}

export default CollectPackagesModel
