import database from "../../database";

function registerNewItem(
  ticket_id: number,
  producer: string,
  category: string,
  sn: string
) {
  return new Promise((resolveRegisterNewItem, rejectRegisterNewItem) => {
    let sql = `INSERT INTO items (name, category, ticket_id, shelve, sn) VALUES (
        ?, ?, ?, 0, ?
    ); UPDATE tickets SET inWarehouse = 1 WHERE ticket_id = ?`;
    let data = [producer, category, ticket_id, sn, ticket_id];

    database.query(sql, data, (err, result) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY")
          return rejectRegisterNewItem([
            400,
            {
              message: "produkt z podanym ticket id został już zarejestrowany",
            },
          ]);
        rejectRegisterNewItem([500, err]);
      }
      resolveRegisterNewItem(result);
    });
  });
}

export default registerNewItem;
