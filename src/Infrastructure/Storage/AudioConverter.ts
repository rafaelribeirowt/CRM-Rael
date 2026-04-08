import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import os from "os";
import { randomUUID } from "crypto";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export function convertToOgg(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tmpIn = path.join(os.tmpdir(), `${randomUUID()}.webm`);
    const tmpOut = path.join(os.tmpdir(), `${randomUUID()}.ogg`);

    fs.writeFileSync(tmpIn, inputBuffer);

    ffmpeg(tmpIn)
      .audioCodec("libopus")
      .audioChannels(1)
      .audioFrequency(48000)
      .format("ogg")
      .on("end", () => {
        try {
          const outBuffer = fs.readFileSync(tmpOut);
          fs.unlinkSync(tmpIn);
          fs.unlinkSync(tmpOut);
          resolve(outBuffer);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        try { fs.unlinkSync(tmpIn); } catch {}
        try { fs.unlinkSync(tmpOut); } catch {}
        reject(err);
      })
      .save(tmpOut);
  });
}
