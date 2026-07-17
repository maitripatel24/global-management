const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "icon-source.svg");
const outFile = path.join(__dirname, "..", "src", "app", "favicon.ico");

function packIco(images) {
  // images: [{ size, buffer }] of PNG-encoded buffers
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4); // count

  const dirEntries = [];
  const dataChunks = [];

  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(buffer.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // image offset
    offset += buffer.length;
    dirEntries.push(entry);
    dataChunks.push(buffer);
  }

  return Buffer.concat([header, ...dirEntries, ...dataChunks]);
}

async function run() {
  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes) {
    const buffer = await sharp(source, { density: 384 }).resize(size, size).png().toBuffer();
    images.push({ size, buffer });
  }
  const ico = packIco(images);
  fs.writeFileSync(outFile, ico);
  console.log(`Generated favicon.ico with sizes: ${sizes.join(", ")}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
