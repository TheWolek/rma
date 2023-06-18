export const addCollectValidator = (
  refName: string
): [boolean, { message: string } | string] => {
  if (refName === null || refName === undefined || refName === "") {
    return [false, { message: "Pole refName jest wymagane" }];
  }

  return [true, ""];
};

export const addCollectItemValidator = (
  waybill: string
): [boolean, { message: string } | string] => {
  if (waybill === undefined || waybill === null || waybill === "") {
    return [false, { message: "Pole waybill jest wymagane" }];
  }

  if (typeof waybill !== "string")
    return [false, { message: "błędny format pola waybill" }];

  return [true, ""];
};
