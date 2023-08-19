import { regBarcode } from "./regEx";

export default (barcode: string): Boolean => {
  return regBarcode.test(barcode);
};
