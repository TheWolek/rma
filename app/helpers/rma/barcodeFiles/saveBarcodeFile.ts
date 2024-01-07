import QRCode from "qrcode"
import PDFDocument from "pdfkit"
import fs from "node:fs/promises"
import getBarcodeFilePath from "./getBarcodeFilePath"

export interface SaveBarcodeData {
  barcode: string
  ticketId: number
}

export default async ({ barcode, ticketId }: SaveBarcodeData) => {
  try {
    const qrcode = await QRCode.toDataURL(barcode)
    const doc = new PDFDocument({
      size: [180, 180],
      margins: { top: 10, bottom: 10, left: 32, right: 10 },
    })
    doc.image(qrcode, { align: "center" })
    doc.fontSize(15).text(`\n${barcode}`, 10, 110, { align: "center" })
    doc.end()

    await fs.writeFile(getBarcodeFilePath(ticketId, "save"), doc)
    return getBarcodeFilePath(ticketId, "read")
  } catch (error) {
    console.log(error)
    return ""
  }
}
