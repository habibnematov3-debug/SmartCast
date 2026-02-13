import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function saveFileToUploads(file: File, folder: "campaigns" | "proofs") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".bin";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const targetPath = path.join(uploadDir, safeName);
  await fs.writeFile(targetPath, buffer);

  return `/uploads/${folder}/${safeName}`;
}