import type { Tool } from "../types"

export type MediaProviderId = "comfyui" | "runpod"

export type MediaTaskType =
  | "image_generation"
  | "image_editing"
  | "video_generation"
  | "upscaling"
  | "background_removal"

export type MediaAsset = {
  url?: string
  prompt?: string
  mimeType?: string
  width?: number
  height?: number
}

export type MediaJob = {
  provider: MediaProviderId
  task: MediaTaskType
  model: string
  prompt: string
  status: "draft" | "queued" | "running" | "completed" | "fallback"
  output?: MediaAsset
  details?: Record<string, any>
}

export type MediaToolInput = Record<string, any>

export type MediaTool = Tool
