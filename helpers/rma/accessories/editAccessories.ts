import database from "../../database";

const editAccessories = (ticketId: string, accessories: Array<number>) => {
  return new Promise(function (resolve, reject) {
    const sql_delete = `DELETE FROM tickets_additionalAccessories WHERE ticket_id = ${database.escape(
      ticketId
    )}`;

    let sql_update = `INSERT INTO tickets_additionalAccessories (ticket_id, type_id) VALUES `;

    if (accessories.length !== 0) {
      accessories.forEach((el: number, index: number) => {
        if (index > 0) sql_update += ",";
        sql_update += `(${database.escape(ticketId)}, ${database.escape(el)})`;
      });
    }

    database.query(sql_delete, (err) => {
      if (err) return reject(err);

      if (accessories.length > 0) {
        return database.query(sql_update, (err) => {
          if (err) return reject(err);

          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });
  });
};

export default editAccessories;
