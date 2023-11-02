import Joi from "joi"
import { regBarcode } from "../../../helpers/regEx"

export default {
  itemBarcode: Joi.object({
    barcode: Joi.string().required().regex(regBarcode),
  }).required(),

  shevlveId: Joi.object({
    shelve: Joi.number().required(),
  }).required(),

  changeShelve: Joi.object({
    barcodes: Joi.array().items(Joi.string().required().regex(regBarcode)),
    new_shelve: Joi.number().required(),
    shelve: Joi.number().required(),
  }).required(),

  deleteItem: Joi.object({
    barcode: Joi.string().required().regex(regBarcode),
    shelve: Joi.number().required(),
  }).required(),
}
