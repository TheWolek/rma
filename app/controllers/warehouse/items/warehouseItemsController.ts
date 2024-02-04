import express, { Request, Response } from "express"
import throwGenericError from "../../../helpers/throwGenericError"
import warehouseItemsModel from "../../../models/warehouse/items/warehouseItemsModel"
import { connection } from "../../../models/dbProm"
import {
  ItemListFilters,
  changeShelveBody,
  deleteItemBody,
  newItemReqBody,
} from "../../../types/warehouse/items/itemsTypes"
import validators from "./validators"
import auth, { Roles } from "../../../middlewares/auth"
import RmaModel from "../../../models/rma/rmaModel"
import removeBarcodeFile from "../../../helpers/rma/barcodeFiles/removeBarcodeFile"
import { getUserId } from "../../../helpers/jwt"
import LogModel from "../../../models/logs/logModel"

class warehouseItemController {
  public path = "/warehouse/items"
  public router = express.Router()

  constructor() {
    this.initRoutes()
    console.log(`Controller ${this.path} initialized`)
  }

  public initRoutes() {
    this.router.post(this.path, auth(Roles.ItemsCommon), this.createNewItem)
    this.router.get(
      `${this.path}/exists`,
      auth(Roles.ItemsCommon),
      this.checkIfItemExists
    )
    this.router.get(this.path, auth(Roles.ItemsCommon), this.findItem)
    this.router.get(
      `${this.path}/countall`,
      auth(Roles.ItemsCommon),
      this.countAllItems
    )
    this.router.put(
      `${this.path}/changeshelve`,
      auth(Roles.ItemsLs),
      this.changeShelve
    )
    this.router.delete(this.path, auth(Roles.ItemsLs), this.deleteItem)
  }

  private ItemModel = new warehouseItemsModel()
  private RmaModel = new RmaModel()
  private logModel = new LogModel()

  createNewItem = async (
    req: Request<{}, {}, newItemReqBody>,
    res: Response
  ) => {
    // recive barcode in format "RMA/YYYYMMDD/1234" and sn (String)
    // return 400 if barcode is empty OR barcode does not match regEx OR ticket_id already exists in items table
    // return 500 if there was DB error
    // return 200 {inserted id, barcode, shelve id}

    const { error } = validators.itemBarcode.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const ticket = await this.RmaModel.getOneForWarehouse(
        conn,
        req.body.barcode
      )

      const item = {
        ticket_id: ticket[0].ticket_id,
        barcode: ticket[0].barcode,
        producer: ticket[0].device_producer,
        category: ticket[0].device_cat,
        sn: ticket[0].device_sn,
      }

      const dbResult = await this.ItemModel.createNewItem(conn, item)

      conn.commit()

      return res.status(200).json({
        id: dbResult.insertId,
        barcode: req.body.barcode,
        shelve: 0,
      })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  checkIfItemExists = async (
    req: Request<{}, {}, {}, { barcode: string }>,
    res: Response
  ) => {
    // recive barcode in format "RMA/YYYYMMDD/1234"
    // return 400 if barcode is empty OR barcode does not match regEx
    // return 404 with {found: false} if nothing was found
    // return 500 if there was DB error
    // return 200 with {founmax_line_lengthd: true}

    const { error } = validators.itemBarcode.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.ItemModel.checkIfItemExists(
        conn,
        req.query.barcode
      )

      if (rows.length === 0) {
        return res.status(404).json({ found: false })
      }

      conn.commit()

      res.status(200).json({ found: true })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  findItem = async (
    req: Request<{}, {}, {}, ItemListFilters>,
    res: Response
  ) => {
    // recive barcode in format "RMA/YYYYMMDD/1234"
    // return 400 if barcode is empty OR barcode does not match regEx
    // return 404 if nothing was found
    // return 500 if there was DB error
    // returns 200 with first row object {item_id: int, name: string, shelve: int, category: string, barcode: string}

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.ItemModel.findItems(conn, req.query)

      conn.commit()

      return res.status(200).json(rows)
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  countAllItems = async (req: Request, res: Response) => {
    // return 404 if there is no items
    // return 500 if there was DB error
    // return 200 with {"productCount": INT}

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const rows = await this.ItemModel.countAllItems(conn)

      return res.status(200).json({ productCount: rows[0].count })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  changeShelve = async (
    req: Request<{}, {}, changeShelveBody>,
    res: Response
  ) => {
    // recive barcodes in format ["RMA/YYYYMMDD/1234",...], destination shelve id INT and current shelve id INT
    // return 400 if barcode OR new_shelve OR shelve is empty
    // return 400 if barcode OR new_shelve OR shelve does not match regEx
    // return 400 if current and destiantion sheleve are equal
    // return 404 if no rows were changes
    // return 404 with message {} if number of rows changed is diffrent from number of barcodes
    // reutrn 500 if there was DB error
    // returns 200 with {barcodes: [], new_shelve id}

    const { error } = validators.changeShelve.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    if (req.body.new_shelve === req.body.shelve)
      return throwGenericError(
        res,
        400,
        "Wybrana półka docelowa jest identczna jak aktualna"
      )

    const data = {
      new_shelve: req.body.new_shelve,
      shelve: req.body.shelve,
      barcodes: req.body.barcodes,
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const dbResult = await this.ItemModel.changeShelve(conn, data)

      if (dbResult.affectedRows === 0) {
        return throwGenericError(
          res,
          404,
          "Nie przesunięto żadnych przedmiotów. Sprawdź poprawność kodów kreskowych"
        )
      }

      if (dbResult.affectedRows != req.body.barcodes.length) {
        conn.rollback()
        return throwGenericError(
          res,
          404,
          "Ilość przesuniętych produktów różni się od zeskanowanych kodów kreskowych"
        )
      }

      return res.status(200).json({
        barcodes: req.body.barcodes,
        new_shelve: req.body.new_shelve,
      })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }

  deleteItem = async (req: Request<{}, {}, deleteItemBody>, res: Response) => {
    // recive barcode in format "RMA/YYYYMMDD/1234" and current shelve INT
    // return 400 if barcode OR shelve is empty
    // return 400 if barcode OR shelve does not match regEx
    // return 404 if nothing was deleted = cannot find specific item
    // return 500 if there was DB error
    // return 200 with {barcode: string, shelve: INT}

    const { error } = validators.deleteItem.validate(req.body)

    if (error !== undefined) {
      return throwGenericError(res, 400, error?.details[0].message)
    }

    const conn = await connection.getConnection()
    await conn.beginTransaction()

    try {
      const userId = getUserId(String(req.headers.authorization?.split(" ")[1]))

      const deleteItemDbResult = await this.ItemModel.deleteItem(
        conn,
        req.body.barcode,
        req.body.shelve
      )

      if (deleteItemDbResult.affectedRows === 0) {
        return throwGenericError(
          res,
          404,
          "nie można znaleźć wskazanego produktu na magazynie. Nic nie zostało usunięte"
        )
      }

      await this.RmaModel.unregister(conn, req.body.ticket_id)

      await removeBarcodeFile(req.body.ticket_id)

      this.logModel.log(conn, {
        action: "unregister",
        log: "Usunięto z magazynu",
        ticketId: req.body.ticket_id,
        user_id: userId,
      })

      conn.commit()

      return res
        .status(200)
        .json({ barcode: req.body.barcode, shelve: req.body.shelve })
    } catch (error) {
      conn.rollback()
      return throwGenericError(res, 500, String(error), error)
    } finally {
      conn.release()
    }
  }
}

export default warehouseItemController
