import database from "../../database";

function checkIfWaybillExists(waybill: string) {
  return new Promise(function (resolveCheck, rejectCheck) {
    let sql = `SELECT id, waybill_number FROM waybills WHERE waybill_number=${database.escape(
      waybill
    )} and status = 'potwierdzony';`;

    database.query(sql, function (err, rows) {
      if (err) return rejectCheck([500, err]);
      resolveCheck(rows);
    });
  });
}

export default checkIfWaybillExists;
