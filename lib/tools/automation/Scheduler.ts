import { DEFAULT_SCHEDULE_DELAY_MS } from "./constants"
import type { AutomationJob } from "./AutomationTypes"

type ScheduledTask = AutomationJob & {
  id: string
  runAt: string
  timerId?: ReturnType<typeof setTimeout>
  executedAt?: string
}

function createId() {
  return `sched-${Math.random().toString(36).slice(2, 10)}`
}

class SchedulerStore {
  private tasks = new Map<string, ScheduledTask>()

  schedule(job: AutomationJob, delayMs = DEFAULT_SCHEDULE_DELAY_MS) {
    const id = createId()
    const runAt = new Date(Date.now() + delayMs).toISOString()

    const scheduled: ScheduledTask = {
      ...job,
      id,
      runAt,
    }

    scheduled.timerId = setTimeout(() => {
      const current = this.tasks.get(id)
      if (current) {
        current.executedAt = new Date().toISOString()
        current.status = "completed"
        this.tasks.set(id, current)
      }
    }, delayMs)

    this.tasks.set(id, scheduled)
    return scheduled
  }

  list() {
    return [...this.tasks.values()].sort((left, right) => right.runAt.localeCompare(left.runAt))
  }

  get(id: string) {
    return this.tasks.get(id)
  }

  cancel(id: string) {
    const task = this.tasks.get(id)
    if (!task) return false
    if (task.timerId) clearTimeout(task.timerId)
    this.tasks.delete(id)
    return true
  }

  reset() {
    for (const task of this.tasks.values()) {
      if (task.timerId) clearTimeout(task.timerId)
    }
    this.tasks.clear()
  }
}

export const scheduler = new SchedulerStore()
