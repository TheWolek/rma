export interface newItemData {
  ticket_id: number
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
  barcode: string
  shelve: number
}
