import database from "../../database";

function getWaybillsFromCollect(collect_id: string) {
  return new Promise(function (resolveFindWaybills, rejectFindWaybills) {
    let sql = `SELECT pci.id, pci.waybill, pci.ticket_id, t.device_producer, t.device_cat, t.device_sn
    FROM packageCollect_items pci 
    JOIN tickets t on t.ticket_id = pci.ticket_id
    WHERE collect_id = ${database.escape(collect_id)}`;

    database.query(sql, (err, rows) => {
      if (err) rejectFindWaybills([500, err]);
      resolveFindWaybills(rows);
    });
  });
}

export default getWaybillsFromCollect;
