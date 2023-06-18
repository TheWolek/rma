import checkIfWaybillExists from "./checkIfWaybillExists";
import formatDateAndHours from "../../../utils/formatDateAndHours";
import database from "../../database";

function changeWaybillStatus(waybill: string, newStatus: string) {
  return checkIfWaybillExists(waybill).then(function (rows: any) {
    return new Promise(function (resolveChange, rejectChange) {
      if (rows.length === 0) {
        return rejectChange([404, "Brak listu o podanym ID"]);
      }

      let currTimeStamp = formatDateAndHours(new Date());
      let sql = `UPDATE waybills SET status = ?, lastUpdate = ? WHERE waybill_number = ?;`;
      let data = [newStatus, currTimeStamp, waybill];

      database.query(sql, data, (err) => {
        if (err) return rejectChange([500, err]);
        return resolveChange(true);
      });
    });
  });
}

export default changeWaybillStatus;
