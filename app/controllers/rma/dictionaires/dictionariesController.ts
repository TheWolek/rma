import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import DictionariesModel from "../../../models/rma/dictionariesModel"
import { MysqlError, OkPacket } from "mysql"
import auth, { Roles } from "../../../middlewares/auth"
import {
  DictType,
  DictTable,
  DictRow,
} from "../../../types/rma/dictionariesTypes"
import Validator from "./dictionariesValidator"

class DictionariesController {
  public path = "/rma/dictionary"
  public router = express.Router()

  public dictTypes: { [key: string]: { type: DictType; table: DictTable } } = {
    damages: {
      type: "damages",
      table: "tickets_damage_types",
    },
    accessories: {
      type: "accessories",
      table: "tickets_aditionalAccessories_types",
    },
    statuses: {
      type: "statuses",
      table: "tickets_statuses_types",
    },
    results: {
      type: "results",
      table: "tickets_result_types",
    },
  }

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.get(
      `${this.path}/getDict/:name`,
      auth(Roles.Common),
      this.getDict
    )
  }

  private Model = new DictionariesModel()

  getDict = (req: Request<{ name: DictType }>, res: Response) => {
    if (
      Object.keys(this.dictTypes).filter((key) => key === req.params.name)
        .length === 0
    ) {
      return throwGenericError(
        res,
        404,
        `Nie znaleziono słownika ${req.params.name}`
      )
    }

    const table = this.dictTypes[req.params.name].table

    this.Model.getDict(table, (err: MysqlError, rows: DictRow[]) => {
      if (err) {
        return throwGenericError(res, 500, err, err)
      }

      return res.status(200).json(rows)
    })
  }

  editDict = (req: Request<{ name: DictType }, {}, DictRow>, res: Response) => {
    const { error } = Validator.editDict.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.Model.editDict(
      req.params.name,
      req.body,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) {
          return throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({})
      }
    )
  }
}

export default DictionariesController
