import db from "../db"
import query from "../dbProm"
import { MysqlError, OkPacket } from "mysql"
import { ResultSetHeader } from "mysql2"
import mysql from "mysql2/promise"
import {
  AccessoriesRow,
  CommentRow,
  CreateReqBody,
  DetailsRow,
  FilteredRow,
  Filters,
  PartRow,
  UpdateTicketReqBody,
  WarehouseDetailsRow,
  BarcodeData,
} from "../../types/rma/rmaTypes"
import { detailsFields, listFields } from "./constants"
import formatDate from "../../helpers/formatDate"
import calculatePages from "../../helpers/calculatePages"

class RmaModel {
  create = async (conn: mysql.PoolConnection, ticketData: CreateReqBody) => {
    const date = new Date()
    const timestamp = `${formatDate(date).split("-").join("")}`
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    const sqlTicket = `insert into tickets (barcode, email, name, phone, device_sn, device_name, device_cat, device_producer, type, issue, status, \`lines\`, postCode, city, damage_type, damage_description) VALUES \ 
        (${db.escape(`RMA/${timestamp}/${randomNumber}`)},
        ${db.escape(ticketData.email)}, 
        ${db.escape(ticketData.name)}, 
        ${db.escape(ticketData.phone)}, 
        ${db.escape(ticketData.deviceSn)}, 
        ${db.escape(ticketData.deviceName)}, 
        ${db.escape(ticketData.deviceCat)}, 
        ${db.escape(ticketData.deviceProducer)}, 
        ${db.escape(ticketData.type)}, 
        ${db.escape(ticketData.issue)}, 
        1, 
        ${db.escape(ticketData.lines)}, 
        ${db.escape(ticketData.postCode)}, 
        ${db.escape(ticketData.city)}, 
        ${db.escape(ticketData.damageType)}, 
        ${db.escape(ticketData.damageDescription)})`

    try {
      const ticketDbResult = await query(conn, sqlTicket)

      if (ticketData.deviceAccessories.length > 0) {
        const sqlAccessoriesPlaceholders = ticketData.deviceAccessories.map(
          () => "(?,?)"
        )
        const sqlAccessories = `insert into tickets_additionalAccessories (ticket_id, type_id) VALUES ${sqlAccessoriesPlaceholders.join(
          ","
        )}`

        let data: number[] = []

        ticketData.deviceAccessories.forEach((el) => {
          data.push((ticketDbResult as ResultSetHeader)?.insertId)
          data.push(el)
        })

        await query(conn, sqlAccessories, data)
      }

      return ticketDbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  filter = async (conn: mysql.PoolConnection, filters: Filters) => {
    const queryFilters: string[] = []
    const params = []

    if (filters.barcode) {
      queryFilters.push("t.barcode = ?")
      params.push(filters.barcode)
    }

    if (filters.status) {
      queryFilters.push("t.status = ?")
      params.push(filters.status)
    }
    if (filters.type) {
      queryFilters.push("t.type = ?")
      params.push(filters.type)
    }
    if (filters.deviceSn) {
      queryFilters.push("t.device_sn = ?")
      params.push(filters.deviceSn)
    }
    if (filters.deviceProducer) {
      queryFilters.push("t.device_producer like ?")
      params.push(`%${filters.deviceProducer}%`)
    }
    if (filters.email) {
      queryFilters.push("t.email like ?")
      params.push(`%${filters.email}%`)
    }
    if (filters.name) {
      queryFilters.push("t.name like ?")
      params.push(`%${filters.name}%`)
    }
    if (filters.phone) {
      queryFilters.push("t.phone like ?")
      params.push(`%${filters.phone}%`)
    }
    if (filters.date) {
      queryFilters.push("t.created like ?")
      params.push(`%${filters.date}%`)
    }

    if (filters.waybill) {
      queryFilters.push("w.waybill_number like ?")
      params.push(`%${filters.waybill}%`)
    }

    let sql = `SELECT ${listFields} FROM tickets t`

    if (filters.waybill) {
      sql += ` JOIN waybills w ON t.ticket_id = w.ticket_id `
    }

    const condition = `${queryFilters.join(" AND ")}`
    const pageSize = 4
    let pageNumber = filters?.pageNumber || 1

    try {
      const pageCount = await calculatePages(
        conn,
        `tickets t ${
          filters.waybill ? "JOIN waybills w ON t.ticket_id = w.ticket_id" : ""
        }`,
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
      } ${condition} ORDER BY t.created desc LIMIT ${pageSize} OFFSET ${offset}`

      const rows = (await query(conn, sql, params)) as FilteredRow[]

      return {
        items: rows,
        pageCount: pageCount,
        currentPage: Number(pageNumber),
      }
    } catch (error) {
      throw error
    }
  }

  getOne = async (conn: mysql.PoolConnection, ticketId: number) => {
    const sql = `SELECT DISTINCT ${detailsFields} FROM tickets t LEFT JOIN items i ON t.ticket_id = i.ticket_id
    LEFT JOIN shelves s ON i.shelve = s.shelve_id LEFT JOIN waybills w ON t.ticket_id = w.ticket_id
    WHERE t.ticket_id = ${db.escape(ticketId)}`

    try {
      const rows = (await query(conn, sql)) as DetailsRow[]

      rows[0].inWarehouse = rows[0]?.inWarehouse === 1

      return rows as DetailsRow[]
    } catch (error) {
      throw error
    }
  }

  getOneForWarehouse = async (conn: mysql.PoolConnection, barcode: string) => {
    const sql = `SELECT barcode, ticket_id, device_producer, device_cat, device_name, device_sn FROM tickets WHERE barcode = ${db.escape(
      barcode
    )}`

    try {
      const rows = await query(conn, sql)
      return rows as WarehouseDetailsRow[]
    } catch (error) {
      throw error
    }
  }

  editTicket = async (
    conn: mysql.PoolConnection,
    ticketId: number,
    ticketData: UpdateTicketReqBody
  ) => {
    const sql_tickets = `UPDATE tickets SET type = ?, email = ?, name = ?, phone = ?, device_sn = ?, issue = ?, \`lines\` = ?, postCode = ?, city = ?, damage_type = ?, damage_description = ?, result_type = ?, result_description = ? WHERE ticket_id = ?`
    const params_tickets = [
      ticketData.type,
      ticketData.email,
      ticketData.name,
      ticketData.phone,
      ticketData.deviceSn,
      ticketData.issue,
      ticketData.lines,
      ticketData.postCode,
      ticketData.city,
      ticketData.damage_type,
      ticketData.damage_description,
      ticketData.result_type,
      ticketData.result_description,
      ticketId,
    ]

    try {
      const dbResult = await query(conn, sql_tickets, params_tickets)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  getAccessories = async (conn: mysql.PoolConnection, ticketId: number) => {
    const sql = `SELECT taat.id, taat.name FROM tickets_additionalAccessories taa JOIN tickets_aditionalAccessories_types taat on taa.type_id = taat.id
    WHERE taa.ticket_id = ${db.escape(ticketId)};`

    try {
      const rows = await query(conn, sql)
      return rows as AccessoriesRow[]
    } catch (error) {
      throw error
    }
  }

  editAccessories = async (
    conn: mysql.PoolConnection,
    ticketId: number,
    accessories: number[]
  ) => {
    const sql_delete = `DELETE FROM tickets_additionalAccessories WHERE ticket_id = ${db.escape(
      ticketId
    )}`
    let sql_update = `INSERT INTO tickets_additionalAccessories (ticket_id, type_id) VALUES `
    let placeholders: string[] = []
    let params: (number | string)[] = []

    accessories.forEach((el) => {
      placeholders.push("(?,?)")
      params.push(ticketId, el)
    })

    sql_update += placeholders.join(",")

    try {
      await query(conn, sql_delete)
      if (accessories.length > 0) {
        await query(conn, sql_update, params)
      }

      return true
    } catch (error) {
      throw error
    }
  }

  addComment = (ticketId: number, comment: string, result: Function) => {
    const sql = `INSERT INTO tickets_comments (ticket_id, comment) VALUES (${db.escape(
      ticketId
    )}, "${db.escape(comment)}");`

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  getComments = (ticketId: number, result: Function) => {
    const sql = `SELECT comment, created FROM tickets_comments WHERE ticket_id = ${db.escape(
      ticketId
    )};`

    db.query(sql, (err: MysqlError, rows: CommentRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  register = async (conn: mysql.PoolConnection, ticketId: number) => {
    const sql = `UPDATE tickets SET inWarehouse=1 WHERE ticket_id=${db.escape(
      ticketId
    )};`

    try {
      const dbResult = await query(conn, sql)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  unregister = async (conn: mysql.PoolConnection, ticketId: number) => {
    const sql = `UPDATE tickets SET inWarehouse=0 WHERE ticket_id=${db.escape(
      ticketId
    )};`

    try {
      const dbResult = await query(conn, sql)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  changeState = async (
    conn: mysql.PoolConnection,
    ticketId: number,
    status: number
  ) => {
    const sql = `UPDATE tickets SET status = ?, lastStatusUpdate = NOW() WHERE ticket_id = ?`
    const params = [status, ticketId]

    try {
      const dbResult = await query(conn, sql, params)
      return dbResult as ResultSetHeader
    } catch (error) {
      throw error
    }
  }

  getBarcode = async (conn: mysql.PoolConnection, ticketId: Number) => {
    const sql = `SELECT ticket_id, barcode FROM tickets WHERE ticket_id = ${db.escape(
      ticketId
    )}`

    try {
      const rows = await query(conn, sql)
      return rows as BarcodeData[]
    } catch (error) {
      throw error
    }
  }

  usePart = (ticketId: number, code: string, result: Function) => {
    const sql = `INSERT INTO tickets_spareparts (ticket_id, sparepart_sn) VALUES (${db.escape(
      ticketId
    )}, ${db.escape(code)});`

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  getParts = (ticketId: number, result: Function) => {
    const sql = `SELECT ts.id, ts.sparepart_sn, sc.category, sc.producer, sc.name 
    from tickets_spareparts ts 
    join spareparts_sn ss on ts.sparepart_sn = ss.codes
    join spareparts s on ss.part_id = s.part_id
    join spareparts_cat sc on s.cat_id = sc.part_cat_id
    WHERE ts.ticket_id = ${db.escape(ticketId)};`

    db.query(sql, (err: MysqlError, rows: PartRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }
}

export default RmaModel
