import db from "../db"
import { MysqlError, OkPacket } from "mysql"
import {
  AccessoriesRow,
  CommentRow,
  CreateReqBody,
  Filters,
  PartRow,
  UpdateTicketReqBody,
} from "../../types/rma/rmaTypes"
import { fields } from "./constants"

class RmaModel {
  create = (ticketData: CreateReqBody, result: Function) => {
    const sqlTicket = `insert into tickets (email, name, phone, device_sn, device_name, device_cat, device_producer, type, issue, status, \`lines\`, postCode, city, damage_type, damage_description) VALUES \ 
        (${db.escape(ticketData.email)}, ${db.escape(
      ticketData.name
    )}, ${db.escape(ticketData.phone)}, ${db.escape(
      ticketData.deviceSn
    )}, ${db.escape(ticketData.deviceName)}, ${db.escape(
      ticketData.deviceCat
    )}, ${db.escape(ticketData.deviceProducer)}, ${db.escape(
      ticketData.type
    )}, ${db.escape(ticketData.lines)}, 1, ${db.escape(
      ticketData.issue
    )}, ${db.escape(ticketData.postCode)}, ${db.escape(
      ticketData.city
    )}, ${db.escape(ticketData.damageType)}, ${db.escape(
      ticketData.damageDescription
    )})`

    db.query(sqlTicket, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      if (ticketData.deviceAccessories.length > 0) {
        const sqlAccessoriesPlaceholders = ticketData.deviceAccessories.map(
          () => "(?,?)"
        )

        const sqlAccessories = `insert into tickets_additionalAccessories (ticket_id, type_id) VALUES ${sqlAccessoriesPlaceholders.join(
          ","
        )}`

        let data: number[] = []

        ticketData.deviceAccessories.forEach((el) => {
          data.push(dbResult.insertId)
          data.push(el)
        })

        db.query(sqlAccessories, data, (err, dbResultAcc) => {
          if (err) {
            return result(err, null)
          }
          return result(null, dbResult)
        })
      } else {
        return result(null, dbResult)
      }
    })
  }

  filter = (filters: Filters, result: Function) => {
    const queryFilters: string[] = []
    const params = []

    if (filters.ticketId) {
      queryFilters.push("t.ticket_id = ?")
      params.push(filters.ticketId)
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

    let sql = `SELECT ${fields} FROM tickets t LEFT JOIN items i ON t.ticket_id = i.ticket_id
    LEFT JOIN shelves s ON i.shelve = s.shelve_id`

    if (filters.waybill) {
      sql += ` JOIN waybills w ON t.ticket_id = w.ticket_id `
    }

    sql += ` WHERE 1=1 ${
      queryFilters.length > 0 ? "AND" : ""
    } ${queryFilters.join(" AND ")} ORDER BY t.created desc`

    db.query(sql, params, (err, rows) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  editTicket = (
    ticketId: number,
    ticketData: UpdateTicketReqBody,
    result: Function
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

    db.query(sql_tickets, params_tickets, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  getAccessories = (ticketId: number, result: Function) => {
    const sql = `SELECT taat.id, taat.name FROM tickets_additionalAccessories taa JOIN tickets_aditionalAccessories_types taat on taa.type_id = taat.id
    WHERE taa.ticket_id = ${db.escape(ticketId)};`

    db.query(sql, (err: MysqlError, rows: AccessoriesRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  editAccessories = (
    ticketId: number,
    accessories: number[],
    result: Function
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

    db.query(sql_delete, (err) => {
      if (err) {
        return result(err, null)
      }

      if (accessories.length > 0) {
        return db.query(sql_update, params, (err) => {
          if (err) {
            return result(err, null)
          }

          return result(null, true)
        })
      } else {
        return result(null, true)
      }
    })
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

  register = (ticketId: number, result: Function) => {
    const sql = `UPDATE tickets SET inWarehouse=1 WHERE ticket_id=${db.escape(
      ticketId
    )};`

    db.query(sql, (err: MysqlError, dbResult: OkPacket) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  changeState = (ticketId: number, status: number, result: Function) => {
    const sql = `UPDATE tickets SET status = ?, lastStatusUpdate = NOW() WHERE ticket_id = ?`
    const params = [status, ticketId]

    db.query(sql, params, (err) => {
      if (err) {
        return result(err, null)
      }

      return result(null, true)
    })
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
