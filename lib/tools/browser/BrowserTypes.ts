import type { BrowserSession } from "./types"

export type BrowserSelector = string

export type BrowserPoint = {
  x: number
  y: number
}

export type BrowserRect = BrowserPoint & {
  width: number
  height: number
}

export type BrowserTabInfo = {
  id: string
  url: string
  title: string
  active: boolean
}

export type BrowserCookie = {
  name: string
  value: string
  domain?: string
  path?: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "Lax" | "Strict" | "None"
}

export type BrowserStorageState = {
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
}

export type BrowserNetworkEntry = {
  type: "request" | "response"
  url: string
  method?: string
  status?: number
  resourceType?: string
  timestamp: string
}

export type BrowserDownloadInfo = {
  suggestedFilename: string
  path?: string
  url?: string
}

export type BrowserVisionPrompt = {
  prompt: string
  screenshotPath?: string
  imageBase64?: string
}

export type BrowserToolContext = {
  session: BrowserSession
}
