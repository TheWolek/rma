import { NextFunction, Request, Response } from "express"
import { userData, verifyJWT } from "../helpers/jwt"

export const Roles = {
  Admin: ["Admin"],
  Common: ["Admin", "LS", "TECH", "CC"],
  SparepartsCatalog: ["Admin", "LS", "TECH"],
  SparepartsOrders: ["Admin", "LS"],
  ItemsCommon: ["Admin", "LS", "TECH"],
  ItemsLs: ["Admin", "LS"],
  RmaCommon: ["Admin", "TECH", "CC"],
  CollectPackages: ["Admin", "LS"],
  TasksCommon: ["Admin", "LS"],
}

function auth(roles: string[]) {
  return (req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) {
      return res.sendStatus(401)
    }

    verifyJWT(token, (err: unknown, payload: userData) => {
      if (payload == null || err) {
        return res.sendStatus(401)
      }

      const isAuthorized = payload.rolesArray.some((roleValue) =>
        roles.includes(roleValue)
      )

      if (!isAuthorized) {
        console.log("role error", payload, roles)
        return res.sendStatus(401)
      }

      req.user = payload

      next()
    })
  }
}

export default auth
