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
    damageDescription: Joi.string(),
    type: Joi.number().required(),
  }),

  edit: Joi.object({
    type: Joi.number().required(),
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    phone: Joi.string().required().regex(RegEx.phoneNumber),
    deviceSn: Joi.string().required(),
    issue: Joi.string().required(),
    lines: Joi.string().required().regex(RegEx.lines),
    postCode: Joi.string().required().regex(RegEx.postCode),
    city: Joi.string().required(),
    damage_type: Joi.number().required(),
    result_type: Joi.number().optional(),
    deviceAccessories: Joi.array().items(Joi.number()).required(),
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
    type: Joi.string().required().valid("przychodzący", "wychodzący"),
    status: Joi.string()
      .required()
      .valid("potwierdzony", "odebrany", "anulowany"),
  }),
}
