import Joi from "joi"

export default {
  editUser: Joi.object({
    change_password: Joi.bool().required(),
    role: Joi.string().required(),
  }),
}
