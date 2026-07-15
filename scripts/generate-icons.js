const sharp = require("sharp");
const path = require("path");

const source = path.join(__dirname, "icon-source.svg");
const publicDir = path.join(__dirname, "..", "public");

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

async function run() {
  for (const { file, size } of targets) {
    await sharp(source, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, file));
    console.log(`Generated ${file} (${size}x${size})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
