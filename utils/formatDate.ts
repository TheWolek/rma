const formatDate = (dateIn: string | Date) => {
  const d = new Date(dateIn);
  return (
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2)
  );
};

export default formatDate;
