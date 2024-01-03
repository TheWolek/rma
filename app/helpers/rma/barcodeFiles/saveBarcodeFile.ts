import QRCode from "qrcode"
import getBarcodeFilePath from "./getBarcodeFilePath"

export interface SaveBarcodeData {
  barcode: string
  ticketId: number
}

export default async ({ barcode, ticketId }: SaveBarcodeData) => {
  try {
    await QRCode.toFile(getBarcodeFilePath(ticketId, "save"), barcode, {
      type: "png",
    })
    return getBarcodeFilePath(ticketId, "read")
  } catch (error) {
    console.log(error)
    return ""
  }
}
