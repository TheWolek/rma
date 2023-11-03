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
}
