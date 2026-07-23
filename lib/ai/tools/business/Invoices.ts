import { businessStore, upsertInvoice } from "./CRM"

export const Invoices = {
  list() {
    return [...businessStore.invoices.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  get(id: string) {
    return businessStore.invoices.get(id)
  },
  upsert(input: Record<string, any>) {
    return upsertInvoice(input)
  },
  remove(id: string) {
    return businessStore.invoices.delete(id)
  },
}
