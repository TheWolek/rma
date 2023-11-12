import RegEx from "../regEx"

export default (barcode: string): Boolean => {
  return RegEx.barcode.test(barcode)
}
