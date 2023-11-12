export default (rows: any) => {
  let output: any = {}
  rows.forEach((el: any) => {
    if ("cat_" + el.part_cat_id in output) {
      output["cat_" + el.part_cat_id].warehouse.shelves.push(el.shelve)
      output["cat_" + el.part_cat_id].warehouse.parts_id.push(el.part_id)
      //output["cat_" + el.part_cat_id].warehouse.totalAmount += el.amount;
      if (el.codes !== null) {
        output["cat_" + el.part_cat_id].warehouse.codes.push(el.codes)
      }
    } else {
      let part = {
        category: el.category,
        cat_id: el.part_cat_id,
        producer: el.producer,
        name: el.name,
      }
      //let partAmount = el.amount === null ? 0 : el.amount;
      let warehouse = {
        shelves: el.shelve === null ? [] : [el.shelve],
        //totalAmount: partAmount,
        parts_id: el.part_id === null ? [] : [el.part_id],
        codes: el.codes === null ? [] : [el.codes],
      }
      output["cat_" + el.part_cat_id] = {
        part: part,
        warehouse: warehouse,
      }
    }
  })

  Object.keys(output).forEach((el: any) => {
    output[el].warehouse.totalAmount = output[el].warehouse.codes.length
  })

  return output
}
