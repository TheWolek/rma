import Joi from "joi"

export default {
  createOrderBody: Joi.object({
    supplier_id: Joi.number().min(1).required(),
    exp_date: Joi.date().min("now").iso().required(),
  }),

  changeStatusBody: Joi.object({
    order_id: Joi.number().min(1).required(),
    status: Joi.number().min(0).max(4).required(),
  }),

  editBody: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          amount: Joi.number().min(1),
          order_item_id: Joi.number().min(1),
          part_cat_id: Joi.number().min(1),
        })
      )
      .required(),
    orderData: Joi.object({
      expected_date: Joi.date().iso().required(),
      part_order_id: Joi.number().min(1).required(),
      status: Joi.number().min(0).max(4).required(),
      supplier_id: Joi.number().min(1).required(),
    }).required(),
  }),

  findOrderQuery: Joi.object({
    partCatId: Joi.string(),
    expDate: Joi.date().iso(),
    status: Joi.string(),
  })
    .required()
    .min(1),
}
