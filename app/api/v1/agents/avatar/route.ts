import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const AVATAR_DIR = path.join(process.cwd(), "public", "agents", "avatar")
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      )
    }

    // Ensure the destination directory exists
    if (!existsSync(AVATAR_DIR)) {
      await mkdir(AVATAR_DIR, { recursive: true })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const dest = path.join(AVATAR_DIR, filename)

    const bytes = await file.arrayBuffer()
    await writeFile(dest, Buffer.from(bytes))

    const url = `/agents/avatar/${filename}`

    return NextResponse.json({ success: true, url })
  } catch (err) {
    console.error("Avatar upload error:", err)
    return NextResponse.json({ success: false, message: "Upload failed." }, { status: 500 })
  }
}
