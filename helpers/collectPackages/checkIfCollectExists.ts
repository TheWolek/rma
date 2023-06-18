import database from "../database";

function checkIfCollectExists(id: string) {
  return new Promise(function (resolve, reject) {
    let sql = `SELECT id, status FROM packageCollect WHERE id = ${database.escape(
      id
    )}`;
    database.query(sql, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export default checkIfCollectExists;
