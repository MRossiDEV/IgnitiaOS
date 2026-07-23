import { MediaTool } from "./MediaTool"
import type { MediaTool as MediaToolType } from "./MediaTypes"

export const ImageGeneration: MediaToolType = {
  name: "image_generation",
  description: "Generate marketing, social, product, or concept images",
  async run(input) {
    return MediaTool.imageGeneration(input)
  },
}
