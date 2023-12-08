import Joi from "joi"

export default {
  createAccount: Joi.object({
    login: Joi.string().required().messages({
      "string.empty": "Pole login jest wymagane",
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": "Pole password jest wymagane",
      "string.min": "Hasło musi składać się z minimum 8 znaków",
    }),
    roles: Joi.array()
      .items(Joi.string().required())
      .required()
      .min(1)
      .messages({
        "array.empty": "Pole roles jest wymagane",
      }),
  }),

  login: Joi.object({
    login: Joi.string().required().messages({
      "string.empty": "Pole login jest wymagane",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Pole password jest wymagane",
    }),
  }),
}
