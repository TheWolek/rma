import db from "../db"
import { MysqlError, OkPacket } from "mysql"
import { CreateReqBody, Filters } from "../../types/rma/rmaTypes"
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
}

export default RmaModel
