import { MediaTool } from "./MediaTool"
import type { MediaTool as MediaToolType } from "./MediaTypes"

export const ImageEditing: MediaToolType = {
  name: "image_editing",
  description: "Edit or transform existing images with prompt-driven instructions",
  async run(input) {
    return MediaTool.imageEditing(input)
  },
}
