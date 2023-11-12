import { TaskItem, TaskTypeRow } from "../../types/tasks/tasksTypes"
import db from "../db"
import { MysqlError } from "mysql"

class TasksModel {
  getTypes = (result: Function) => {
    const sql = `SELECT wtl.id, wtl.name, wtl.displayName, wtl.shelve_out, wtl.shelve_in FROM warehouse_tasks_lists wtl`

    db.query(sql, (err: MysqlError, rows: TaskTypeRow[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }

  getTasksLists = async (list: TaskTypeRow[], result: Function) => {
    const queries = []

    for (const el of list) {
      const sql = `SELECT count(*) as active FROM ${el.name}`
      const query = new Promise((resolve, reject) => {
        db.query(sql, (err: MysqlError, rows: { active: number }[]) => {
          if (err) {
            return reject(err)
          }

          resolve({
            ...el,
            active: rows[0].active,
          })
        })
      })

      queries.push(query)
    }

    return result(null, await Promise.all(queries))
  }

  getDetails = (taskName: string, result: Function) => {
    const sql = `SELECT item_id, barcode FROM ${taskName}`

    db.query(sql, (err: MysqlError, rows: TaskItem[]) => {
      if (err) {
        return result(err, null)
      }

      return result(null, rows)
    })
  }
}

export default TasksModel
