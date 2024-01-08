import {
  CreateWaybillBody,
  EditWaybillBody,
  FindWaybillReqQuery,
  WaybillRow,
} from "../../types/rma/rmaTypes"
import db from "../db"
import query from "../dbProm"
import { ResultSetHeader } from "mysql2"
import mysql from "mysql2/promise"

class WaybillsModel {
  find = async (conn: mysql.PoolConnection, params: FindWaybillReqQuery) => {
    let sql = `SELECT id, waybill_number, ticket_id, status, type, created, lastUpdate
         FROM waybills WHERE `
    if (params.ticketId) {
      sql += `ticket_id = ${db.escape(params.ticketId)}`
    } else {
      sql += `waybill_number = ${db.escape(params.waybillNumber)}`
    }

    const rows = await query(conn, sql)

    return rows as WaybillRow[]
  }

  create = async (
    conn: mysql.PoolConnection,
    waybillData: CreateWaybillBody
  ) => {
    const sql = `INSERT INTO waybills (waybill_number, ticket_id, status, type) VALUES
     (?, ?, 'potwierdzony', ?)`
    const params = [
      waybillData.waybillNumber,
      waybillData.ticketId,
      waybillData.type,
    ]

    const dbResult = await query(conn, sql, params)

    return dbResult as ResultSetHeader
  }

  edit = async (
    conn: mysql.PoolConnection,
    waybillId: number,
    waybillData: EditWaybillBody
  ) => {
    const sql = `UPDATE waybills SET waybill_number = ?, status = ?, type = ?, lastUpdate = NOW()
    WHERE id = ?`
    const params = [
      waybillData.waybillNumber,
      waybillData.status,
      waybillData.type,
      waybillId,
    ]

    const dbResult = await query(conn, sql, params)

    return dbResult as ResultSetHeader
  }
}

export default WaybillsModel
