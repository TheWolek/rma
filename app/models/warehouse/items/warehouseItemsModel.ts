import db from "../../db"
import mysql, { ResultSetHeader } from "mysql2/promise"
import query from "../../dbProm"
import {
  ChangeShelveData,
  Item,
  ItemListFilters,
  newItemData,
} from "../../../types/warehouse/items/itemsTypes"
import calculatePages from "../../../helpers/calculatePages"

class warehouseItemsModel {
  createNewItem = async (conn: mysql.PoolConnection, item: newItemData) => {
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

    try {
      const dbResult = await query(conn, sql, data)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  checkIfItemExists = async (conn: mysql.PoolConnection, barcode: string) => {
    let sql = `SELECT item_id FROM items WHERE barcode = ${db.escape(barcode)}`

    try {
      const rows = await query(conn, sql)
      return rows as { item_id: number }[]
    } catch (error) {
      throw error
    }
  }

  findItems = async (conn: mysql.PoolConnection, filters: ItemListFilters) => {
    const queryFilters: string[] = []
    const params = []

    if (filters.barcode) {
      queryFilters.push("barcode = ?")
      params.push(filters.barcode)
    }

    if (filters.shelve_id) {
      queryFilters.push("shelve = ?")
      params.push(filters.shelve_id)
    }

    let sql = `SELECT i.item_id, i.name, i.shelve, i.category, i.ticket_id, i.barcode, i.sn, s.code as shelve_code FROM items i JOIN shelves s ON i.shelve = s.shelve_id`
    const condition = `${queryFilters.join(" AND ")}`
    const pageSize = 4
    let pageNumber = filters?.pageNumber || 1

    try {
      const pageCount = await calculatePages(
        conn,
        "items i JOIN shelves s ON i.shelve = s.shelve_id",
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

      sql += ` WHERE 1=1 ${
        queryFilters.length > 0 ? "AND" : ""
      } ${condition} ORDER BY i.item_id DESC LIMIT ${pageSize} OFFSET ${offset}`

      const rows = (await query(conn, sql, params)) as Item[]
      return {
        items: rows,
        pageCount: pageCount,
        currentPage: Number(pageNumber),
      }
    } catch (error) {
      throw error
    }
  }

  countAllItems = async (conn: mysql.PoolConnection) => {
    const sql = `SELECT count(*) as 'count' FROM items`

    try {
      const rows = await query(conn, sql)
      return rows as { count: number }[]
    } catch (error) {
      throw error
    }
  }

  changeShelve = async (
    conn: mysql.PoolConnection,
    { new_shelve, shelve, barcodes }: ChangeShelveData
  ) => {
    let barcodes_placeholder = barcodes.map((el) => "?")
    let sql = `UPDATE items SET shelve = ? 
    WHERE shelve = ? AND barcode in (${barcodes_placeholder.join(",")})`
    let data = [new_shelve, shelve, ...barcodes]

    try {
      const dbResult = await query(conn, sql, data)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  deleteItem = async (
    conn: mysql.PoolConnection,
    barcode: string,
    shelve: number
  ) => {
    const sql = `DELETE FROM items WHERE barcode = ${db.escape(
      barcode
    )} AND shelve = ${db.escape(shelve)}`

    const dbResult = await query(conn, sql)

    return dbResult as ResultSetHeader
  }
}

export default warehouseItemsModel
