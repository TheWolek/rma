import { userData } from "./app/helpers/jwt"

declare global {
  namespace Express {
    interface Request {
      user?: userData
    }
  }
}
