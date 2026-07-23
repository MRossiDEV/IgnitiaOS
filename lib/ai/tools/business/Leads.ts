import { businessStore, upsertLead } from "./CRM"

export const Leads = {
  list() {
    return [...businessStore.leads.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  get(id: string) {
    return businessStore.leads.get(id)
  },
  upsert(input: Record<string, any>) {
    return upsertLead(input)
  },
  remove(id: string) {
    return businessStore.leads.delete(id)
  },
}
