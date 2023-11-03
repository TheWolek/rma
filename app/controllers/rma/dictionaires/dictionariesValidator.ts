import Joi from "joi"

export default {
  editDict: Joi.object({
    id: Joi.number().required().greater(0),
    newValue: Joi.string().required(),
  }).required(),
}
