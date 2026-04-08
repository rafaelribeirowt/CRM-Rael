import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { env } from "../../Shared/Env";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "audio/ogg; codecs=opus": "ogg",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "application/pdf": "pdf",
};

export function saveMedia(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): string {
  const uploadDir = path.resolve(env.MEDIA_UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext =
    MIME_EXT[mimeType] ||
    (fileName ? path.extname(fileName).slice(1) : mimeType.split("/")[1]) ||
    "bin";

  const name = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, name);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${name}`;
}
