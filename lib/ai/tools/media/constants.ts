export const DEFAULT_MEDIA_PROVIDER = "comfyui"
export const DEFAULT_MEDIA_MODEL = "flux-dev"
export const DEFAULT_VIDEO_MODEL = "wan2.1"
export const DEFAULT_UPSCALER_MODEL = "4x-ultrasharp"

export const MEDIA_PROVIDER_IDS = ["comfyui", "runpod"] as const

export const COMFYUI_BASE_URL = process.env.COMFYUI_BASE_URL || ""
export const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY || ""
export const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || ""

export const MEDIA_TIMEOUT_MS = 120_000
