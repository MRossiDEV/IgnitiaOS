import { DEFAULT_MEDIA_MODEL, DEFAULT_MEDIA_PROVIDER, DEFAULT_UPSCALER_MODEL } from "./constants"
import { submitToComfyUI } from "./ComfyUI"
import { submitToRunpod } from "./Runpod"
import type { MediaJob, MediaProviderId, MediaTaskType, MediaToolInput } from "./MediaTypes"

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function resolveProvider(input: MediaToolInput): MediaProviderId {
  const provider = normalizeText(input.provider || DEFAULT_MEDIA_PROVIDER).toLowerCase()
  return provider === "runpod" ? "runpod" : "comfyui"
}

function buildPrompt(input: MediaToolInput, fallback: string) {
  return normalizeText(input.prompt || input.description || input.task || fallback)
}

function buildJob(input: MediaToolInput, task: MediaTaskType, promptFallback: string): MediaJob {
  const provider = resolveProvider(input)
  const prompt = buildPrompt(input, promptFallback)

  return {
    provider,
    task,
    model: normalizeText(input.model || input.styleModel || input.upscaler || DEFAULT_MEDIA_MODEL || DEFAULT_UPSCALER_MODEL) || DEFAULT_MEDIA_MODEL,
    prompt,
    status: "draft",
    details: {
      width: Number(input.width || 1024),
      height: Number(input.height || 1024),
      aspectRatio: normalizeText(input.aspectRatio || input.aspect_ratio || "1:1") || "1:1",
      seed: input.seed ?? null,
      steps: Number(input.steps || 30),
      guidance: Number(input.guidance || input.cfg || 7),
      negativePrompt: normalizeText(input.negativePrompt || input.negative_prompt || ""),
      sourceImage: input.image || input.sourceImage || input.asset || null,
      outputFormat: normalizeText(input.outputFormat || input.format || "png") || "png",
    },
  }
}

export const MediaTool = {
  async imageGeneration(input: MediaToolInput) {
    const job = buildJob(input, "image_generation", "Generate a high-quality image")
    return job.provider === "runpod" ? submitToRunpod(job) : submitToComfyUI(job)
  },
  async imageEditing(input: MediaToolInput) {
    const job = buildJob(input, "image_editing", "Edit the provided image")
    return job.provider === "runpod" ? submitToRunpod(job) : submitToComfyUI(job)
  },
  async videoGeneration(input: MediaToolInput) {
    const job = buildJob(input, "video_generation", "Generate a short promotional video")
    return job.provider === "runpod" ? submitToRunpod(job) : submitToComfyUI(job)
  },
  async upscaler(input: MediaToolInput) {
    const job = buildJob(input, "upscaling", "Upscale the provided asset")
    return job.provider === "runpod" ? submitToRunpod({
      ...job,
      model: normalizeText(input.model || input.upscaler || DEFAULT_UPSCALER_MODEL) || DEFAULT_UPSCALER_MODEL,
    }) : submitToComfyUI({
      ...job,
      model: normalizeText(input.model || input.upscaler || DEFAULT_UPSCALER_MODEL) || DEFAULT_UPSCALER_MODEL,
    })
  },
  async backgroundRemoval(input: MediaToolInput) {
    const job = buildJob(input, "background_removal", "Remove the background from the provided asset")
    return job.provider === "runpod" ? submitToRunpod(job) : submitToComfyUI(job)
  },
}
