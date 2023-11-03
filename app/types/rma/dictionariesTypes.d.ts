export type DictType = "damages" | "accessories" | "statuses" | "results"
export type DictTable =
  | "tickets_damage_types"
  | "tickets_aditionalAccessories_types"
  | "tickets_statuses_types"
  | "tickets_result_types"

export interface DictRow {
  id: number
  name: string
}
