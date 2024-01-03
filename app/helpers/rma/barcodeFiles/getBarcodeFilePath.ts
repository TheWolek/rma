import { join } from "path"

export type BarcodeFilePathMode = "save" | "read"

export default (ticketId: number, mode: BarcodeFilePathMode) => {
  if (mode === "save") {
    return join(process.cwd(), "public", `${ticketId}.jpg`)
  } else {
    return `static/${ticketId}.jpg`
  }
}
