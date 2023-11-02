import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import sparepartsModel from "../../../models/warehouse/spareparts/sparepartsModel"
import { MysqlError, OkPacket } from "mysql"
import {
  findQuery,
  newCategoryBody,
  partToWarehouse,
} from "../../../types/warehouse/spareparts/sparepartsTypes"

import validators from "./validators"
import auth, { Roles } from "../../../middlewares/auth"

class sparepartsController {
  public path = "/warehouse/spareparts"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(
      `${this.path}/new`,
      auth(Roles.SparepartsCatalog),
      this.addCategory
    )
    this.router.post(
      this.path,
      auth(Roles.SparepartsCatalog),
      this.addPartToWarehouse
    )
    this.router.get(this.path, auth(Roles.SparepartsCatalog), this.find)
    this.router.post(
      `${this.path}/use`,
      auth(Roles.SparepartsCatalog),
      this.usePart
    )
    this.router.get(
      `${this.path}/stock`,
      auth(Roles.SparepartsCatalog),
      this.getStock
    )
    this.router.get(
      `${this.path}/categories`,
      auth(Roles.SparepartsCatalog),
      this.getCategories
    )
    this.router.get(
      `${this.path}/suppliers`,
      auth(Roles.SparepartsCatalog),
      this.getSuppliers
    )
    this.router.get(
      `${this.path}/statuses`,
      auth(Roles.SparepartsCatalog),
      this.getStatuses
    )
  }

  private SparepartsModel = new sparepartsModel()

  addCategory = (req: Request<{}, {}, newCategoryBody>, res: Response) => {
    // recive {"name": string, "category": string, "producer": string}
    // return 400 if any of parameters is missig OR is empty OR does not match regEx
    // return 500 if there was DB error
    // return 200 with {"id": INT}

    const { error } = validators.addCategory.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.SparepartsModel.addNewCategory(
      req.body.name,
      req.body.category,
      req.body.producer,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json({ id: dbResult.insertId })
      }
    )
  }

  addPartToWarehouse = (
    req: Request<{}, {}, partToWarehouse[]>,
    res: Response
  ) => {
    // recive [{"cat_id": INT, "amount": INT}, ...]
    // return 400 if array is empty
    // return 400 if any of parameters is missing OR is empty OR does not match regEx
    // return 500 if there was DB error
    // return 200 with {"part_id": INT}

    const { error } = validators.addToWarehouse.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.SparepartsModel.addPartToWarehouse(
      req.body,
      (err: MysqlError, dbResult: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json({ insertedRows: dbResult })
      }
    )
  }

  find = (req: Request<{}, {}, {}, findQuery>, res: Response) => {
    let query = req.query

    const { error } = validators.findPart.validate(query)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    // if (Object.keys(query).length === 0)
    //   return throwGenericError(
    //     res,
    //     400,
    //     "Podaj przynajmniej jedną wartość do wyszukania"
    //   )

    // let conditions = 0
    // let onlyOneStatement = false

    // if (query.cat_id) {
    //   if (!regNumber.test(query.cat_id.toString()))
    //     return throwGenericError(res, 400, "Nieprawidłowy format pola cat_id")
    //   conditions++
    // }
    // if (query.producer) {
    //   if (!regCatProd.test(query.producer))
    //     return throwGenericError(res, 400, "Nieprawidłowy format pola producer")
    //   conditions++
    // }
    // if (query.category) {
    //   if (!regCatProd.test(query.category))
    //     return throwGenericError(res, 400, "Nieprawidłowy format pola category")
    //   conditions++
    // }
    // if (query.name) {
    //   if (!regCatProd.test(query.name))
    //     return throwGenericError(res, 400, "Nieprawidłowy format pola name")
    //   conditions++
    // }

    // if (conditions === 0)
    //   return throwGenericError(
    //     res,
    //     400,
    //     "Podaj przynajmniej jedną wartość do wyszukania"
    //   )

    this.SparepartsModel.find(
      (err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json(rows)
      },
      query?.cat_id,
      query?.producer,
      query?.category,
      query?.name
    )
  }

  findByCode = (req: Request<{}, {}, {}, { code: string }>, res: Response) => {
    const { error } = validators.findByCode.validate(req.query)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.SparepartsModel.findBySn(
      req.query.code,
      (err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json(rows)
      }
    )
  }

  usePart = (req: Request<{}, {}, { sn: string }>, res: Response) => {
    // recive {"sn": STR}
    // return 400 if any of parameters is missing OR is empty OR does not match regEx
    // return 400 if registered amount is fewer than requested
    // return 404 if cannot find specific part
    // return 500 if there was DB error
    // return 200 on success

    const { error } = validators.usePart.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.SparepartsModel.usePart(req.body.sn, (err: any, dbResult: any) => {
      if (err) {
        if (err === 404 || err === 400) return throwGenericError(res, err, err)
        return throwGenericError(res, 500, err, err)
      }
      return res.status(200).json({})
    })
  }

  getStock = (req: Request<{}, {}, {}, { cat_id: number }>, res: Response) => {
    //recive parameter "cat_id": INT
    // return 400 if no parameters is passed OR is empty
    // return 400 if any of parameters does not match regEx
    // return 404 if cannot find anything
    // return 500 if there was DB error
    // return 200 with
    // {"cat_id": INT, "totalAmount": INT}

    const { error } = validators.getStock.validate(req.query)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    this.SparepartsModel.getStock(
      req.query.cat_id,
      (err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        if (rows.length === 0)
          return throwGenericError(
            res,
            404,
            "Nieznaleziono części na magazynie dla podanych kryteriów"
          )

        res.status(200).json({
          cat_id: rows[0].cat_id,
          totalAmount: rows[0].totalAmount,
        })
      }
    )
  }

  getCategories = (req: Request, res: Response) => {
    this.SparepartsModel.getCategories((err: MysqlError, rows: any) => {
      if (err) return throwGenericError(res, 500, err, err)
      return res.status(200).json(rows)
    })
  }

  getSuppliers = (req: Request, res: Response) => {
    this.SparepartsModel.getSuppliers((err: MysqlError, rows: any) => {
      if (err) return throwGenericError(res, 500, err, err)
      return res.status(200).json(rows)
    })
  }

  getStatuses = (req: Request, res: Response) => {
    this.SparepartsModel.getStatuses((err: MysqlError, rows: any) => {
      if (err) return throwGenericError(res, 500, err, err)
      return res.status(200).json(rows)
    })
  }
}

export default sparepartsController
