import { MediaTool } from "./MediaTool"
import type { MediaTool as MediaToolType } from "./MediaTypes"

export const BackgroundRemoval: MediaToolType = {
  name: "background_removal",
  description: "Remove backgrounds from product or portrait images",
  async run(input) {
    return MediaTool.backgroundRemoval(input)
  },
}

