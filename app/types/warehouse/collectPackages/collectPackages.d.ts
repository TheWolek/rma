export type CollectStatus = "W trakcie" | "Odebrany"

export interface CollectFilters {
  refName: string
  created: string
  status: CollectStatus
}

export interface CollectRow {
  id: number
  ref_name: string
  created: Date
  status: CollectStatus
}

export interface CollectDetailsRow extends CollectRow {
  waybill: string
  ticket_id: number
  barcode: string
}

export interface CollectWaybilRow {
  id: number
  waybill: string
  ticket_id: number
  device_producer: string
  device_cat: string
  device_sn: string
}

export interface CollectTicketRow {
  ticket_id: number
  barcode: string
  waybill_number: string
}

export interface CollectItemRow {
  waybill: string
  ticket_id: number
}

export interface CollectEditItemReqBody {
  items: CollectItemRow[]
}
