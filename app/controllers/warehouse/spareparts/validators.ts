import Joi from "joi"

export default {
  addCategory: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    producer: Joi.string().required(),
  }).required(),

  addToWarehouse: Joi.array()
    .items(
      Joi.object({
        cat_id: Joi.number().required().min(1),
        amount: Joi.number().required().min(1),
      })
    )
    .required()
    .min(1),

  findPart: Joi.object({
    producer: Joi.string(),
    category: Joi.string(),
    name: Joi.string(),
    cat_id: Joi.number().min(1),
  })
    .required()
    .min(1),

  findByCode: Joi.object({
    code: Joi.string().required(),
  }).required(),

  usePart: Joi.object({
    sn: Joi.string().required(),
  }).required(),

  getStock: Joi.object({
    cat_id: Joi.number().required(),
  }).required(),
}
