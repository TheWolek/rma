import Joi from "joi"

export default {
  create: Joi.object({
    refName: Joi.string().required(),
  }),
  addItem: Joi.object({
    waybill: Joi.string().required(),
  }),
  editItem: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          waybill: Joi.string().required(),
          ticket_id: Joi.number().required(),
        })
      )
      .required(),
  }),
}
