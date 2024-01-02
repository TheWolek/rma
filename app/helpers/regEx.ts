export default {
  phoneNumber: /^(\d{3}) (\d{3}) (\d{3})$/,
  lines: /^([a-żA-Ż0-9/. ]){2,}([1-9]){0,}([0-9]){1,}$/,
  postCode: /^([0-9]){2}-([0-9]){3}$/,
  barcode: /^RMA\/(\d){8}\/(\d){4}$/,
}
