import { unlink } from "fs/promises"
import getBarcodeFilePath from "./getBarcodeFilePath"

export default async (ticketId: number) => {
  const path = getBarcodeFilePath(ticketId, "read")
  try {
    await unlink(path)
  } catch (error) {
    console.log(error)
  }
}
