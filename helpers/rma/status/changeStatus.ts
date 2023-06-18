import formatDateAndHours from "../../../utils/formatDateAndHours";
import database from "../../database";

function changeTicketStaus(ticket_id: number, newStatus: number) {
  return new Promise((resolveChangeTicketStatus, rejectChangeTicketStatus) => {
    const updateDate = formatDateAndHours(new Date());
    let sql = `UPDATE tickets SET status = ?, lastStatusUpdate = ? WHERE ticket_id = ?`;
    let data = [newStatus, updateDate, ticket_id];

    database.query(sql, data, (err) => {
      if (err) rejectChangeTicketStatus([500, err]);
      resolveChangeTicketStatus(true);
    });
  });
}

export default changeTicketStaus;
