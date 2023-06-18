import {
  addCollect_reqBodyI,
  addCollectItem_reqBodyI,
} from "../../utils/constants/collectPackages/interfaces";

export const addCollectValidator = (refName: string): [boolean, string] => {
  if (refName === null || refName === undefined || refName === "") {
    return [false, "Pole refName jest wymagane"];
  }

  return [true, ""];
};

export const addCollectItemValidator = () => {};
