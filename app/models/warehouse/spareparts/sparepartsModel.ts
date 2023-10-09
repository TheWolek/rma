import checkPartAmount from "../../../helpers/checkPartAmount"
import sparepartsResponse from "../../../helpers/sparepartsResponse"
import { partToWarehouse } from "../../../types/warehouse/spareparts/sparepartsTypes"
import db from "../../db"
import { MysqlError, OkPacket } from "mysql"

class sparepartsModel {
  addNewCategory(
    name: string,
    category: string,
    producer: string,
    result: Function
  ) {
    const sql = `INSERT INTO spareparts_cat 
    (name, category, producer) VALUES (?,?,?)`
    const data = [name, category, producer]
    db.query(sql, data, (err, dbResult) => {
      if (err) return result(err.code, null)
      return result(null, dbResult)
    })
  }

  addPartToWarehouse(parts: partToWarehouse[], result: Function) {
    let output: Array<any> = []
    let placeholders = []
    let data: Array<any> = []
    let sql = `INSERT INTO spareparts (cat_id, amount) VALUES `

    placeholders = parts.map((el) => "(?,?)")
    parts.forEach((el: partToWarehouse) => {
      data.push(el.cat_id)
      data.push(el.amount)
    })
    output = parts.map((el: partToWarehouse) => {
      return {
        cat_id: el.cat_id,
        insertedId: null,
      }
    })
    sql += placeholders.join(",")
    sql += `; SELECT LAST_INSERT_ID() AS lastid, ROW_COUNT() as rowcount;`

    db.query(sql, data, (err, dbResult) => {
      if (err) return result(err.code, null)
      for (let i = 0; i < dbResult[1][0].rowcount; i++) {
        output[i].insertedId = dbResult[1][0].lastid + i
      }
      return result(null, output)
    })
  }

  find(
    result: Function,
    cat_id?: number,
    producer?: string,
    category?: string,
    name?: string
  ) {
    let statement = []

    if (cat_id) statement.push(`sc.part_cat_id = ${db.escape(cat_id)}`)
    if (producer) {
      producer = `%${producer}%`
      statement.push(
        `sc.producer like ${db.escape(producer.trim().toLowerCase())}`
      )
    }

    if (category) {
      category = `%${category}%`
      statement.push(
        `sc.category like ${db.escape(category.trim().toLowerCase())}`
      )
    }

    if (name) {
      name = `%${name}%`
      statement.push(`sc.name like ${db.escape(name.trim().toLowerCase())}`)
    }

    let sql = `select distinct sc.category, sc.producer, sc.name, sc.part_cat_id, s.part_id, s.amount,
	ss.codes, ss.shelve
    from spareparts_cat sc 
    left join spareparts s on sc.part_cat_id = s.cat_id
    left join spareparts_sn ss on s.part_id = ss.part_id
   	where ${statement.join(" and ")} and ss.isUsed = 0`

    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      const output = sparepartsResponse(rows)
      return result(null, output)
    })
  }

  findBySn(code: string, result: Function) {
    const sql = `select ss.codes, ss.shelve, s.part_id, sc.part_cat_id, sc.category, sc.producer, sc.name from spareparts_sn ss 
    join spareparts s
    on ss.part_id = s.part_id 
    join spareparts_cat sc 
    on s.cat_id = sc.part_cat_id
    where ss.codes = '${db.escape(code)}'`

    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      let part = rows[0]
      let output: any = {}
      let item = {
        part: {
          category: part.category,
          cat_id: part.part_cat_id,
          producer: part.producer,
          name: part.name,
        },
        warehouse: {
          shelve: part.shelve,
          part_id: part.part_id,
          codes: part.codes,
        },
      }

      output["cat_" + part.part_cat_id] = item

      return result(null, output)
    })
  }

  usePart(sn: string, result: Function) {
    checkPartAmount(sn).then(function (rows: any) {
      if (rows.length === 0) return result(404, null)
      if (rows[0].amount < 1) return result(400, null)

      const part_id = rows[0].part_id
      const newAmount = rows[0].amount - 1
      const sql = `update spareparts set amount = ${newAmount} where part_id = ${part_id};
      update spareparts_sn set isUsed = 1 where codes = '${sn}' and part_id = ${part_id};`
      const data = [newAmount, part_id, sn, part_id]

      db.query(sql, data, (err, dbResult) => {
        if (err) return result(err.code, null)
        return result(null, dbResult)
      })
    })
  }

  getStock(cat_id: number, result: Function) {
    const sql = `SELECT cat_id, sum(amount) as 'totalAmount'
    FROM spareparts s WHERE cat_id = ${db.escape(cat_id)} GROUP BY cat_id`

    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  getCategories(result: Function) {
    const sql = `SELECT part_cat_id, producer, category, name FROM spareparts_cat`
    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  getSuppliers(result: Function) {
    const sql = `SELECT id, name FROM suppliers`
    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }

  getStatuses(result: Function) {
    const sql = `SELECT id, name FROM spareparts_orders_statuses`
    db.query(sql, (err: MysqlError, rows: any) => {
      if (err) return result(err.code, null)
      return result(null, rows)
    })
  }
}

export default sparepartsModel
