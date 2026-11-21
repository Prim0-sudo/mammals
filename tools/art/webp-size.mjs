// Reads the pixel size of a WebP file (VP8X, lossy VP8 or lossless VP8L). Returns null if it is not a WebP.
export function webpSize(d) {
  if (d.toString("ascii", 0, 4) !== "RIFF" || d.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = d.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + d.readUIntLE(24, 3), 1 + d.readUIntLE(27, 3)];
  if (chunk === "VP8 ") return [d.readUInt16LE(26) & 0x3fff, d.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") { const b = d.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)]; }
  return null;
}
