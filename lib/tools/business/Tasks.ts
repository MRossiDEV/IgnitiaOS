import { businessStore, upsertTask } from "./CRM"

export const Tasks = {
  list() {
    return [...businessStore.tasks.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  get(id: string) {
    return businessStore.tasks.get(id)
  },
  upsert(input: Record<string, any>) {
    return upsertTask(input)
  },
  remove(id: string) {
    return businessStore.tasks.delete(id)
  },
}
