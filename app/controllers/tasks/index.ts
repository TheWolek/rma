import express, { Request, Response } from "express"
import throwGenericError from "../../helpers/throwGenericError"
import { MysqlError, OkPacket } from "mysql"
import TasksModel from "../../models/tasks/tasksModel"
import auth, { Roles } from "../../middlewares/auth"
import {
  TaskActiveNumber,
  TaskItem,
  TaskTypeRow,
} from "../../types/tasks/tasksTypes"
import getTasksLists from "../../helpers/tasks/getTasksLists"

class TasksController {
  public path = "/warehouse/tasks"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(this.path, auth(Roles["TasksCommon"]), this.getTypes)

    this.router.get(
      `${this.path}/:type`,
      auth(Roles["TasksCommon"]),
      this.getList
    )

    this.router.get(
      `${this.path}/:taskName/tasks`,
      auth(Roles["TasksCommon"]),
      this.getDetails
    )
  }

  private Model = new TasksModel()

  getTypes = (req: Request, res: Response) => {
    this.Model.getTypes((err: MysqlError, rows: TaskTypeRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  getList = (req: Request<{ type: string }>, res: Response) => {
    if (isNaN(parseInt(req.params.type))) {
      return throwGenericError(res, 400, "Nieprawidłowy format pola type")
    }

    getTasksLists(Number(req.params.type))
      .then(async (rows) => {
        this.Model.getTasksLists(
          rows,
          (err: MysqlError, result: TaskActiveNumber[]) => {
            if (err) {
              return throwGenericError(res, 500, err, err)
            }

            return res.status(200).json(result)
          }
        )
      })
      .catch((error) => throwGenericError(res, 500, error, error))
  }

  getDetails = (req: Request<{ taskName: string }>, res: Response) => {
    this.Model.getDetails(
      req.params.taskName,
      (err: MysqlError, rows: TaskItem[]) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json(rows)
      }
    )
  }
}

export default TasksController
