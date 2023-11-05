import Joi from "joi"
import { regPhoneNumber, regLines, regPostCode } from "../../helpers/regEx"

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
    lines: Joi.string().required().regex(regLines),
    postCode: Joi.string().required().regex(regPostCode),
    city: Joi.string().required(),
    damageType: Joi.number().required(),
    damageDescription: Joi.string(),
    type: Joi.number().required(),
  }),

  edit: Joi.object({
    type: Joi.number().required(),
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    phone: Joi.string().required().regex(regPhoneNumber),
    deviceSn: Joi.string().required(),
    issue: Joi.string().required(),
    lines: Joi.string().required().regex(regLines),
    postCode: Joi.string().required().regex(regPostCode),
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
}
