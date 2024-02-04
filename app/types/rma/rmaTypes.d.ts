export interface CreateReqBody {
  email: string
  name: string
  phone: string
  type: string
  deviceSn: string
  deviceName: string
  deviceCat: string
  deviceProducer: string
  deviceAccessories: number[]
  issue: string
  lines: string
  postCode: string
  city: string
  damageType: number
  damageDescription: string
}

export interface UpdateTicketReqBody {
  email: string
  name: string
  phone: string
  type: string
  deviceSn: string
  issue: string
  lines: string
  postCode: string
  city: string
  damage_type: string
  damage_description: string | null
  result_type: null | string
  result_description: null | string
}

export interface Filters {
  pageNumber: number
  barcode: string
  status: number
  type: number
  deviceSn: string
  deviceProducer: string
  email: string
  name: string
  phone: string
  date: string
  waybill: string
}

export interface FilteredRow {
  ticket_id: number
  email: string
  name: string
  phone: string
  device_sn: string
  device_name: string
  device_producer: string
  type: number
  device_accessories: number[]
  issue: string
  status: number
  created: string
  lines: string
  postCode: string
  city: string
  device_cat: string
  lastStatusUpdate: string
  inWarehouse: number
  item_id: number
  shelve_id: number
  code: string
  damage_description: string
  damage_type: nunber
  result_type: number
  result_description: string
}

export type TicketType = 1 | 2
export type TicketStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface DetailsRow {
  ticket_id: number
  barcode: string
  barcodeURL: string | null
  email: string
  name: string
  phone: string
  device_sn: string
  device_name: string
  device_producer: string
  device_cat: string
  type: TicketType
  issue: string
  status: TicketStatus
  created: Date
  lastStatusUpdate: null | Date
  lines: string
  postCode: string
  city: string
  inWarehouse: 0 | 1 | boolean
  item_id: null | number
  shelve_id: null | number
  code: null | string
  damage_description: null | string
  damage_type: number
  result_type: null | number
  result_description: null | string
}

export interface BarcodeData {
  ticket_id: number
  barcode: string
}

export interface WarehouseDetailsRow {
  ticket_id: number
  barcode: string
  device_sn: string
  device_name: string
  device_producer: string
  device_cat: string
}

export interface AccessoriesRow {
  id: number
  name: string
}

export interface CommentRow {
  comment: string
  created: Date
}

export interface PartRow {
  id: number
  sparepart_sn: string
  category: string
  producer: string
  name: string
}

export interface FindWaybillReqQuery {
  ticketId: string
  waybillNumber: string
}

export type WaybillType = "przychodzący" | "wychodzący"
export type WaybillStatus = "potwierdzony" | "odebrany" | "anulowany"

export interface CreateWaybillBody {
  waybillNumber: string
  ticketId: number
  type: WaybillType
}

export interface EditWaybillBody extends CreateWaybillBody {
  status: WaybillStatus
}

export interface WaybillRow {
  id: number
  waybill_number: string
  ticket_id: number
  status: WaybillStatus
  type: WaybillType
  created: Date
  lastUpdate: Date
}

export interface BarcodeTicketData {
  ticket_id: number
  barcode: string
}
