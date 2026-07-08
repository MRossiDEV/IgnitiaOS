import type { BrowserSession } from "./types"
import { touchSession } from "./BrowserUtils"

export class BrowserSessionHandle {
  constructor(private readonly session: BrowserSession) {}

  get id() {
    return this.session.id
  }

  get browser() {
    return this.session.browser
  }

  get context() {
    return this.session.context
  }

  get page() {
    return this.session.page
  }

  get createdAt() {
    return this.session.createdAt
  }

  get updatedAt() {
    return this.session.updatedAt
  }

  touch() {
    touchSession(this.session)
    return this
  }

  snapshot() {
    return {
      id: this.session.id,
      createdAt: this.session.createdAt.toISOString(),
      updatedAt: this.session.updatedAt.toISOString(),
      url: this.session.page.url(),
    }
  }
}
