import type { Browser, BrowserContext, Page } from "playwright";

export type BrowserSession = {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  createdAt: Date;
  updatedAt: Date;
};

export type OpenOptions = {
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
};

export type ScreenshotOptions = {
  fullPage?: boolean;
  path?: string;
};

export type BrowserResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};