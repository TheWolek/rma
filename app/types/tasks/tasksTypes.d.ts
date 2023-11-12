export interface TaskTypeRow {
  id: number
  name: string
  displayName: string
  shelve_out: number
  shelve_in: number
}

export interface TaskActiveNumber extends TaskTypeRow {
  active: number
}

export interface TaskItem {
  item_id: number
  barcode: string
}
