import { businessStore, upsertProject } from "./CRM"

export const Projects = {
  list() {
    return [...businessStore.projects.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  get(id: string) {
    return businessStore.projects.get(id)
  },
  upsert(input: Record<string, any>) {
    return upsertProject(input)
  },
  remove(id: string) {
    return businessStore.projects.delete(id)
  },
}
