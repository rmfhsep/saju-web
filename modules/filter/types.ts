export type FilterCategory = "height" | "smoking" | "drinking" | "politics" | "religion"

export interface FilterData {
  category: FilterCategory | null
  heightMin: number
  heightMax: number
  smoking: string
  drinking: string
  politics: string
  religion: string
}
