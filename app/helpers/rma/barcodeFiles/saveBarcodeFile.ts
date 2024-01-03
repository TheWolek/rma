import PDFDocument from "pdfkit"
import QRCode from "qrcode"
import fs from "node:fs/promises"
import getBarcodeFilePath from "./getBarcodeFilePath"

export interface SaveBarcodeData {
  barcode: string
  ticketId: number
}

export default async ({ barcode, ticketId }: SaveBarcodeData) => {
  try {
    const qrcode = await QRCode.toDataURL(barcode)
    const doc = new PDFDocument({ size: "A7" })

    doc.image(qrcode, 40, 25).text(`\n${barcode}`, 20, 150, { align: "center" })
    doc.end()

    await fs.writeFile(getBarcodeFilePath(ticketId, "save"), doc)
    return getBarcodeFilePath(ticketId, "read")
  } catch (error) {
    console.log(error)
    return ""
  }
}
