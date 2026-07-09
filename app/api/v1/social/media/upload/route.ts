import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function inferMediaType(file: File) {
  if (file.type.startsWith("image/")) {
    return "image" as const;
  }

  if (file.type.startsWith("video/")) {
    return "video" as const;
  }

  throw new Error("Only image and video files are supported");
}

function validateFile(file: File) {
  const mediaType = inferMediaType(file);

  if (mediaType === "image" && file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Maximum size is 15MB");
  }

  if (mediaType === "video" && file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video is too large. Maximum size is 150MB");
  }

  return mediaType;
}

// Instagram's Graph API downloads the media from a public URL, so the bucket
// must exist and be public. Provision it on demand so no manual dashboard
// setup is required for the publisher to work end-to-end.
async function ensurePublicBucket(bucketName: string) {
  const { data: existing } = await supabaseAdmin.storage.getBucket(bucketName);

  if (!existing) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: MAX_VIDEO_BYTES,
      }
    );

    // Another request may have created it between the check and the call.
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`);
    }
    return;
  }

  if (!existing.public) {
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(
      bucketName,
      { public: true }
    );

    if (updateError) {
      throw new Error(
        `Storage bucket "${bucketName}" is private and could not be made public: ${updateError.message}`
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileInput = formData.get("file");

    if (!(fileInput instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File is required",
        },
        { status: 400 }
      );
    }

    const mediaType = validateFile(fileInput);
    const bucketName = process.env.SOCIAL_MEDIA_BUCKET || "social-media";

    await ensurePublicBucket(bucketName);

    const fileName = sanitizeFileName(fileInput.name || `${mediaType}-upload`);
    const objectPath = `publisher/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${fileName}`;

    const content = Buffer.from(await fileInput.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(objectPath, content, {
        contentType: fileInput.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicAsset } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      success: true,
      mediaType,
      fileName: fileInput.name,
      bucket: bucketName,
      path: objectPath,
      url: publicAsset.publicUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload media";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
