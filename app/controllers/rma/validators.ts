import Joi from "joi"
import RegEx from "../../helpers/regEx"

export default {
  create: Joi.object({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    phone: Joi.string().required().length(9),
    deviceSn: Joi.string().required(),
    deviceName: Joi.string().required(),
    deviceCat: Joi.string().required(),
    deviceProducer: Joi.string().required(),
    deviceAccessories: Joi.array().items(Joi.number().required()).required(),
    issue: Joi.string().required(),
    lines: Joi.string().required().regex(RegEx.lines),
    postCode: Joi.string().required().regex(RegEx.postCode),
    city: Joi.string().required(),
    damageType: Joi.number().required(),
    damageDescription: Joi.string().optional().allow(""),
    type: Joi.number().required(),
  }),

  edit: Joi.object({
    type: Joi.number().required(),
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    phone: Joi.string().required().length(9),
    deviceSn: Joi.string().required(),
    issue: Joi.string().required(),
    lines: Joi.string().required().regex(RegEx.lines),
    postCode: Joi.string().required().regex(RegEx.postCode),
    city: Joi.string().required(),
    damage_type: Joi.number().required(),
    damage_description: Joi.string().optional().allow(""),
    result_type: Joi.number().optional().allow(null),
    result_description: Joi.string().optional().allow(null),
  }),

  editAccessories: Joi.object({
    deviceAccessories: Joi.array().items(Joi.number()).required(),
  }),

  postComment: Joi.object({
    comment: Joi.string().required(),
  }),

  changeState: Joi.object({
    status: Joi.number().required().min(1).max(12),
  }),

  usePart: Joi.object({
    code: Joi.string().required(),
  }),

  createWaybill: Joi.object({
    waybillNumber: Joi.string().required(),
    ticketId: Joi.number().required(),
    type: Joi.string().required().valid("przychodzący", "wychodzący"),
  }),

  editWaybill: Joi.object({
    waybillNumber: Joi.string().required(),
    ticketId: Joi.number().required(),
    type: Joi.string().required().valid("przychodzący", "wychodzący"),
    status: Joi.string()
      .required()
      .valid("potwierdzony", "odebrany", "anulowany"),
  }),

  addEditAction: Joi.object({
    ticketId: Joi.number().required(),
    actionName: Joi.string().required(),
    actionPrice: Joi.number().required().allow(0),
  }),

  // editAction: Joi.object({
  //   action_name: Joi.string().required(),
  //   action_price: Joi.number().required().allow(0),
  // }),
}
