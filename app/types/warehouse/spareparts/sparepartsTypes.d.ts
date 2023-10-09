export interface newCategoryBody {
  name: string
  category: string
  producer: string
}

export interface partToWarehouse {
  cat_id: number
  amount: number
}

export interface findQuery {
  producer: string | undefined
  category: string | undefined
  name: string | undefined
  cat_id: number | undefined
}

export interface addOrderBody {
  supplier_id: number
  exp_date: string
}

export interface editOrderStatusBody {
  order_id: number
  status: number
}

export interface orderData {
  expected_date: string
  part_order_id: number
  status: number
  supplier_id: number
}

export interface itemData {
  amount: number
  order_item_id: number
  part_cat_id: number
  toRemove: boolean
}

export interface editOrderBody {
  items: itemData[]
  orderData: orderData
}

export interface find_reqQuery {
  partCatId: string
  expDate: string
  status: string
}

export interface orderItem {
  order_item_id: number
  part_cat_id: number
  amount: number
  codes: string
}

export interface parsedOrderItem extends orderItem {
  codes: string[]
}

export interface addPart {
  order_id: number
  part_cat_id: number
  amount: number
}

export interface removePart {
  toDel: number[]
}

export interface setCodesItem {
  item_id: number
  part_id: number
  codes: string[]
}
