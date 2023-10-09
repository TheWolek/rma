export const regString = /^([a-żA-Ż0-9 ]){2,}$/
export const regEmail = /^(.){1,}@(.){1,}\.([A-z]){1,}$/
export const regPhoneNumber = /^(\d{3}) (\d{3}) (\d{3})$/
export const regLines = /^([a-żA-Ż0-9/. ]){2,}([1-9]){0,}([0-9]){1,}$/
export const regPostCode = /^([0-9]){2}-([0-9]){3}$/
export const regNumber = /^([1-9]){1,}([0-9]){0,}$/
export const regBarcode = /^(\d{1,})-([A-ż(),. 0-9]{1,})-([A-z(),. 0-9]{1,})$/
export const regShelveId = /^(\d{1,})$/
export const regSparepartName = /^([A-ż]{1,})([,. ()0-9'"-]){0,}$/
export const regCatProd = /^([A-ż]{1,})([,. ()0-9'"-]){0,}$/
export const regSN = /^[A-z0-9]{3,}$/
export const regStatus = /^([0-9]{1})$/
export const regDate =
  /^([1-9]{1})([0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/
