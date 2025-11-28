import { create } from "zustand"
import type { Category } from "@/domain/sound"

interface MapStore {
  readonly filters: readonly Category[]
  readonly expanded: boolean
  setFilters: (filters: readonly Category[]) => void
  setExpanded: (expanded: boolean) => void
}

export const useMapStore = create<MapStore>((set) => ({
  filters: ["Feel", "Listen", "See"],
  expanded: false,
  setFilters: (filters) => set({ filters }),
  setExpanded: (expanded) => set({ expanded }),
}))
