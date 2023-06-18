import database from "../../database";

function endCollect(collect_id: string) {
  return new Promise((resolveEndCollect, rejectEndCollect) => {
    let sql = `UPDATE packageCollect SET status = 2 WHERE id = ${database.escape(
      collect_id
    )};`;

    database.query(sql, (err) => {
      if (err) rejectEndCollect([500, err]);
      return resolveEndCollect(true);
    });
  });
}

export default endCollect;
