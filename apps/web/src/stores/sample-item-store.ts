import { create } from "zustand";

interface SampleItemState {
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSampleItemStore = create<SampleItemState>()((set) => ({
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  clearSelection: () => set({ selectedItemId: null }),
}));
