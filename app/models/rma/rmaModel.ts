import db from "../db"
import { MysqlError, OkPacket } from "mysql"
import { createReqBody } from "../../types/rma/rmaTypes"

class RmaModel {
  create = (ticketData: createReqBody, result: Function) => {
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
}

export default RmaModel
