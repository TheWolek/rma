import Joi from "joi"

export default {
  orderIdQuery: Joi.object({
    order_id: Joi.number().required().min(1),
  }).required(),

  addPart: Joi.object({
    order_id: Joi.number().required().min(1),
    part_cat_id: Joi.number().required().min(1),
    amount: Joi.number().required().min(1),
  }).required(),

  removePart: Joi.object({
    toDel: Joi.array().items(Joi.number().required().min(1)).required().min(1),
  }),

  setCode: Joi.array()
    .items(
      Joi.object({
        item_id: Joi.number().required(),
        part_id: Joi.number().required(),
        codes: Joi.array().items(Joi.string().required()).required().min(1),
      }).required()
    )
    .required()
    .min(1),
}
