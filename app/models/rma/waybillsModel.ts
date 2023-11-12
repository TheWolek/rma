import { MysqlError } from "mysql"
import {
  CreateWaybillBody,
  EditWaybillBody,
  FindWaybillReqQuery,
  WaybillRow,
} from "../../types/rma/rmaTypes"
import db from "../db"

class WaybillsModel {
  find = (params: FindWaybillReqQuery, result: Function) => {
    let sql = `SELECT id, waybill_number, ticket_id, status, type, created, lastUpdate
         FROM waybills WHERE `
    if (params.ticketId) {
      sql += `ticket_id = ${db.escape(params.ticketId)}`
    } else {
      sql += `waybill_number = ${db.escape(params.waybillNumber)}`
    }

    db.query(sql, (err: MysqlError, rows: WaybillRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  create = (waybillData: CreateWaybillBody, result: Function) => {
    const sql = `INSERT INTO waybills (waybill_number, ticket_id, status, type) VALUES
     (?, ?, 'potwierdzony', ?)`
    const params = [
      waybillData.waybillNumber,
      waybillData.ticketId,
      waybillData.type,
    ]

    db.query(sql, params, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }

  edit = (
    waybillId: number,
    waybillData: EditWaybillBody,
    result: Function
  ) => {
    const sql = `UPDATE waybills SET waybill_number = ?, status = ?, type = ?, lastUpdate = NOW()
    WHERE id = ?`
    const params = [
      waybillData.waybillNumber,
      waybillData.status,
      waybillData.type,
      waybillId,
    ]

    db.query(sql, params, (err, dbResult) => {
      if (err) {
        return result(err, null)
      }

      return result(null, dbResult)
    })
  }
}

export default WaybillsModel
