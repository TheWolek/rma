import Joi from "joi"

export default {
  createAccount: Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required().min(8),
    roles: Joi.array().items(Joi.string().required()).required().min(1),
  }),

  login: Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
  }),
}
