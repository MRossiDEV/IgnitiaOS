import { businessStore, upsertEstimate } from "./CRM"

export const Estimates = {
  list() {
    return [...businessStore.estimates.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  get(id: string) {
    return businessStore.estimates.get(id)
  },
  upsert(input: Record<string, any>) {
    return upsertEstimate(input)
  },
  remove(id: string) {
    return businessStore.estimates.delete(id)
  },
}
