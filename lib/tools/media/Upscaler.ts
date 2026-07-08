import { MediaTool } from "./MediaTool"
import type { MediaTool as MediaToolType } from "./MediaTypes"

export const Upscaler: MediaToolType = {
  name: "upscaler",
  description: "Upscale images for sharper delivery-ready assets",
  async run(input) {
    return MediaTool.upscaler(input)
  },
}

