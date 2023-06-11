import {
  regString,
  regEmail,
  regPhoneNumber,
  regLines,
  regPostCode,
  regNumber,
} from "../../utils/constants/regEx";
import { updateTicket_reqBodyI } from "../../utils/constants/rma/interfaces";

const editTicketValidator = (
  ticketId: string,
  body: updateTicket_reqBodyI
): [boolean, string] => {
  if (ticketId === null) {
    return [false, "Pole ticketId jest wymagane"];
  }

  if (body.type === undefined || body.type === null || body.type.length === 0) {
    return [false, "Pole type jest wymagane"];
  }
  if (
    body.email === undefined ||
    body.email === null ||
    body.email.length === 0
  ) {
    return [false, "Pole email jest wymagane"];
  }
  if (body.name === undefined || body.name === null || body.name.length === 0) {
    return [false, "Pole name jest wymagane"];
  }
  if (
    body.phone === undefined ||
    body.phone === null ||
    body.phone.length === 0
  ) {
    return [false, "Pole phone jest wymagane"];
  }
  if (
    body.deviceSn === undefined ||
    body.deviceSn === null ||
    body.deviceSn.length === 0
  ) {
    return [false, "Pole deviceSn jest wymagane"];
  }
  if (
    body.issue === undefined ||
    body.issue === null ||
    body.issue.length === 0
  ) {
    return [false, "Pole issue jest wymagane"];
  }
  if (
    body.lines === undefined ||
    body.lines === null ||
    body.lines.length === 0
  ) {
    return [false, "Pole lines jest wymagane"];
  }
  if (
    body.postCode === undefined ||
    body.postCode === null ||
    body.postCode.length === 0
  ) {
    return [false, "Pole postCode jest wymagane"];
  }
  if (body.city === undefined || body.city === null || body.city.length === 0) {
    return [false, "Pole city jest wymagane"];
  }
  if (body.damage_type === undefined || body.damage_type === null) {
    return [false, "Pole damage_type jest wymagane"];
  }

  if (!regNumber.test(ticketId)) {
    return [false, "zły format pola ticketId"];
  }
  if (!regNumber.test(body.type) || !Number.isInteger(body.type)) {
    return [false, "zły format pola type"];
  }
  if (!regEmail.test(body.email)) {
    return [false, "zły format pola email"];
  }
  if (!regString.test(body.name)) {
    return [false, "zły format pola name"];
  }
  if (!regPhoneNumber.test(body.phone)) {
    return [false, "zły format pola phone"];
  }
  if (!regLines.test(body.lines)) {
    return [false, "zły format pola lines"];
  }
  if (!regPostCode.test(body.postCode)) {
    return [false, "zły format pola postCode"];
  }
  if (!regString.test(body.city)) {
    return [false, "zły format pola city"];
  }
  if (!regNumber.test(body.damage_type)) {
    return [false, "zły format pola damage_type"];
  }

  return [true, ""];
};

export default editTicketValidator;
