import Joi from "joi"
import RegEx from "../../../helpers/regEx"

export default {
  itemBarcode: Joi.object({
    barcode: Joi.string().required().regex(RegEx.barcode),
    sn: Joi.string().required(),
  }).required(),

  shevlveId: Joi.object({
    shelve: Joi.number().required(),
  }).required(),

  changeShelve: Joi.object({
    barcodes: Joi.array().items(Joi.string().required().regex(RegEx.barcode)),
    new_shelve: Joi.number().required(),
    shelve: Joi.number().required(),
  }).required(),

  deleteItem: Joi.object({
    barcode: Joi.string().required().regex(RegEx.barcode),
    shelve: Joi.number().required(),
    ticket_id: Joi.number().required(),
  }).required(),
}
