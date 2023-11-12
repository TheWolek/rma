import db from "../../models/db"
import { MysqlError } from "mysql"
import { TaskTypeRow } from "../../types/tasks/tasksTypes"

export default (type: number): Promise<TaskTypeRow[]> => {
  return new Promise((resolve, reject) => {
    const sql = `select wtl.id, wtl.name, wtl.displayName, wtl.shelve_out, wtl.shelve_in from warehouse_tasks_lists wtl WHERE wtl.type = ${db.escape(
      type
    )}`
    db.query(sql, (err, rows) => {
      if (err) {
        return reject(err)
      }
      return resolve(rows)
    })
  })
}
