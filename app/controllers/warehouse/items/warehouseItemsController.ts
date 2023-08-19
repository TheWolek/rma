import express, { Request, Response } from "express"

import throwGenericError from "../../../helpers/throwGenericError"
import warehouseItemsModel from "../../../models/warehouse/items/warehouseItemsModel"
import checkBarcode from "../../../helpers/checkBarcode"
import { MysqlError, OkPacket } from "mysql"
import {
  changeShelveBody,
  deleteItemBody,
  newItemReqBody,
} from "../../../types/warehouse/items/itemsTypes"
import { regShelveId } from "../../../helpers/regEx"

class warehouseItemController {
  public path = "/warehouse/items"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(this.path, this.createNewItem)
    this.router.get(`${this.path}/exists`, this.checkIfItemExists)
    this.router.get(this.path, this.findItemByTicketId)
    this.router.get(`${this.path}/countall`, this.countAllItems)
    this.router.get(`${this.path}/shelve`, this.findItemsInShelve)
    this.router.put(`${this.path}/changeshelve`, this.changeShelve)
    this.router.delete(this.path, this.deleteItem)
  }

  private ItemModel = new warehouseItemsModel()

  createNewItem = (req: Request<{}, {}, newItemReqBody>, res: Response) => {
    // recive barcode in format "ticket_id-name-category" and sn (String)
    // return 400 if barcode is empty OR barcode does not match regEx OR ticket_id already exists in items table
    // return 500 if there was DB error
    // return 200 {inserted id, ticket id, shelve id}
    const barcodeData = req.body.barcode.split("-")
    this.ItemModel.createNewItem(
      {
        ticket_id: parseInt(barcodeData[0]),
        producer: barcodeData[1],
        category: barcodeData[2],
        sn: req.body.sn,
      },
      (err: MysqlError | string, dbRes: OkPacket) => {
        if (err) {
          if (err === "ER_DUP_ENTRY")
            return throwGenericError(
              res,
              400,
              "produkt z podanym ticket id został już zarejestrowany"
            )
          throwGenericError(res, 500, err, err)
        }

        return res.status(200).json({
          id: dbRes.insertId,
          ticket_id: barcodeData[0],
          shelve: 0,
        })
      }
    )
  }

  checkIfItemExists = (
    req: Request<{}, {}, {}, { barcode: string }>,
    res: Response
  ) => {
    // recive barcode in format "ticket-id-name-category"
    // return 400 if barcode is empty OR barcode does not match regEx
    // return 404 with {found: false} if nothing was found
    // return 500 if there was DB error
    // return 200 with {founmax_line_lengthd: true}

    if (!req.query.barcode)
      return throwGenericError(res, 400, "Pole barcode jest wymagane")

    if (!checkBarcode(req.query.barcode))
      return throwGenericError(res, 400, "Nieprawidłowy format pola barcode")

    let ticket_id = parseInt(req.query.barcode.split("-")[0])
    this.ItemModel.checkIfItemExists(
      ticket_id,
      (err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        if (rows.length === 0) return res.status(404).json({ found: false })
        return res.status(200).json({ found: true })
      }
    )
  }

  findItemByTicketId = (
    req: Request<{}, {}, {}, { barcode: string }>,
    res: Response
  ) => {
    // recive barcode in format "ticket_id-name-category"
    // return 400 if barcode is empty OR barcode does not match regEx
    // return 404 if nothing was found
    // return 500 if there was DB error
    // returns 200 with first row object {item_id: int, name: string, shelve: int, category: string, ticket_id: int}

    if (req.query.barcode) {
      if (!checkBarcode(req.query.barcode))
        return throwGenericError(res, 400, "Nieprawidłowy format pola barcode")

      let ticket_id = parseInt(req.query.barcode.split("-")[0])
      this.ItemModel.findItems((err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json(rows)
      }, ticket_id)
    } else {
      this.ItemModel.findItems((err: MysqlError, rows: any) => {
        if (err) return throwGenericError(res, 500, err, err)
        return res.status(200).json(rows)
      })
    }
  }

  findItemsInShelve = (
    req: Request<{}, {}, {}, { shelve: number }>,
    res: Response
  ) => {
    // recive shelve id in req.query INT
    // return 400 if shelve is empty OR shelve does not match regEx
    // return 404 if nothing was found
    // return 500 if there was DB error
    // reutns 200 with array of all items in shelve [{ticket_id: int, name: string, category: string}, ...]
    if (!req.query.shelve)
      return throwGenericError(res, 400, "Pole shelve jest wymagane")

    if (!regShelveId.test(req.query.shelve.toString()))
      return throwGenericError(res, 400, "Nieprawidłowy format pola shelve")

    this.ItemModel.findItems(
      (err: MysqlError, rows: any) => {
        if (err) throwGenericError(res, 500, err, err)
        res.status(200).json(rows)
      },
      undefined,
      req.query.shelve
    )
  }

  countAllItems = (req: Request, res: Response) => {
    // return 404 if there is no items
    // return 500 if there was DB error
    // return 200 with {"productCount": INT}

    this.ItemModel.countAllItems((err: MysqlError, rows: any) => {
      if (err) return throwGenericError(res, 500, err, err)
      if (rows.length === 0)
        return res
          .status(404)
          .json({ message: "Brak przedmiotów na magazynie" })
      return res.status(200).json({ productCount: rows[0].count })
    })
  }

  changeShelve = (req: Request<{}, {}, changeShelveBody>, res: Response) => {
    // recive barcodes in format ["ticket_id-name-category",...], destination shelve id INT and current shelve id INT
    // return 400 if barcode OR new_shelve OR shelve is empty
    // return 400 if barcode OR new_shelve OR shelve does not match regEx
    // return 400 if current and destiantion sheleve are equal
    // return 404 if no rows were changes
    // return 404 with message {} if number of rows changed is diffrent from number of barcodes
    // reutrn 500 if there was DB error
    // returns 200 with {ticket_id_arr: [], new_shelve id}

    if (!req.body.barcodes)
      return throwGenericError(res, 400, "Pole barcodes jest wymagane")
    if (!req.body.new_shelve || req.body.new_shelve === 0)
      return throwGenericError(res, 400, "Pole new_shelve jest wymagane")
    if (!req.body.shelve)
      return throwGenericError(res, 400, "Pole shelve jest wymagane")

    if (!regShelveId.test(req.body.new_shelve.toString()))
      return throwGenericError(res, 400, "Nieprawidłowy format pola new_shelve")
    if (!regShelveId.test(req.body.shelve.toString()))
      return throwGenericError(res, 400, "Nieprawidłowy format pola shelve")

    let err = false
    req.body.barcodes.forEach((el: string) => {
      if (!checkBarcode(el)) {
        err = true
        return res
          .status(400)
          .json({ message: "nieprawidłowy format pola barcode", value: el })
      }
    })

    if (err) return

    if (req.body.new_shelve === req.body.shelve)
      return throwGenericError(
        res,
        400,
        "Wybrana półka docelowa jest identczna jak aktualna"
      )

    let ticket_id_arr = req.body.barcodes.map((el: string) =>
      parseInt(el.split("-")[0])
    )

    this.ItemModel.changeShelve(
      req.body.new_shelve,
      req.body.shelve,
      ticket_id_arr,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) return throwGenericError(res, 500, err, err)
        if (dbResult.changedRows === 0)
          return throwGenericError(
            res,
            404,
            "Nie przesunięto żadnych przedmiotów. Sprawdź poprawność kodów kreskowych"
          )
        if (dbResult.changedRows != ticket_id_arr.length)
          return throwGenericError(
            res,
            404,
            "Ilość przesuniętych produktów różni się od zeskanowanych kodów kreskowych"
          )
        return res.status(200).json({
          ticket_id_arr: ticket_id_arr,
          new_shelve: req.body.new_shelve,
        })
      }
    )
  }

  deleteItem = (req: Request<{}, {}, deleteItemBody>, res: Response) => {
    // recive barcode in format "ticket_id-name-category" and current shelve INT
    // return 400 if barcode OR shelve is empty
    // return 400 if barcode OR shelve does not match regEx
    // return 404 if nothing was deleted = cannot find specific item
    // return 500 if there was DB error
    // return 200 with {ticket_id: INT, shelve: INT}

    if (!req.body.barcode)
      return throwGenericError(res, 400, "Pole barcode jest wymagane")
    if (!req.body.shelve)
      return throwGenericError(res, 400, "Pole shelve jest wymagane")

    if (!checkBarcode(req.body.barcode))
      return throwGenericError(res, 400, "Nieprawidłowy format pola barcode")

    const ticket_id = parseInt(req.body.barcode.split("-")[0])
    this.ItemModel.deleteItem(
      ticket_id,
      req.body.shelve,
      (err: MysqlError, dbResult: OkPacket) => {
        if (err) return throwGenericError(res, 500, err, err)
        if (dbResult.affectedRows === 0)
          return throwGenericError(
            res,
            404,
            "nie można znaleźć wskazanego produktu na magazynie. Nic nie zostało usunięte"
          )
        return res
          .status(200)
          .json({ ticket_id: ticket_id, shelve: req.body.shelve })
      }
    )
  }
}

export default warehouseItemController
