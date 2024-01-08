export interface newItemData {
  ticket_id: number
  barcode: string
  producer: string
  category: string
  sn: string
}

export interface newItemReqBody {
  barcode: string
  sn: string
}

export interface changeShelveBody {
  barcodes: string[]
  new_shelve: number
  shelve: number
}

export interface deleteItemBody {
  ticket_id: number
  barcode: string
  shelve: number
}

export interface Item {
  item_id: number
  name: string
  shelve: number
  category: string
  ticket_id: number
  barcode: string
  sn: string
  shelve_code: string
}

export interface ChangeShelveData {
  new_shelve: number
  shelve: number
  barcodes: string[]
}
