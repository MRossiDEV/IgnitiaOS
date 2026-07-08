import { chromium } from "playwright";
import { randomUUID } from "crypto";
import type { BrowserSession, OpenOptions } from "./types";

class SessionManager {
  private sessions = new Map<string, BrowserSession>();

  async create(options?: OpenOptions): Promise<BrowserSession> {
    const browser = await chromium.launch({
      headless: options?.headless ?? true,
    });

    const context = await browser.newContext({
      viewport: options?.viewport ?? {
        width: 1440,
        height: 900,
      },
    });

    const page = await context.newPage();

    const session: BrowserSession = {
      id: randomUUID(),
      browser,
      context,
      page,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);

    return session;
  }

  get(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  getAll() {
    return [...this.sessions.values()];
  }

  async destroy(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (!session) return;

    await session.browser.close();

    this.sessions.delete(sessionId);
  }

  async destroyAll() {
    for (const session of this.sessions.values()) {
      await session.browser.close();
    }

    this.sessions.clear();
  }
}

export const sessionManager = new SessionManager();