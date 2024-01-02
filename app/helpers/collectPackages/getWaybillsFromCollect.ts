import { MysqlError } from "mysql"
import db from "../../models/db"
import { CollectWaybilRow } from "../../types/warehouse/collectPackages/collectPackages"

export default (collectId: number): Promise<CollectWaybilRow[]> => {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT pci.id, pci.waybill, pci.ticket_id, t.barcode, t.device_producer, t.device_cat, t.device_sn
    FROM packageCollect_items pci 
    JOIN tickets t on t.ticket_id = pci.ticket_id
    WHERE collect_id = ${db.escape(collectId)}`

    db.query(sql, (err: MysqlError, rows: CollectWaybilRow[]) => {
      if (err) {
        return reject([500, err])
      }
      resolve(rows)
    })
  })
}
