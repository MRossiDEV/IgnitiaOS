import { MediaTool } from "./MediaTool"
import type { MediaTool as MediaToolType } from "./MediaTypes"

export const VideoGeneration: MediaToolType = {
  name: "video_generation",
  description: "Generate short-form videos, motion concepts, and promo clips",
  async run(input) {
    return MediaTool.videoGeneration(input)
  },
}
