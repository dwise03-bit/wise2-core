const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImages() {
  const publicDir = path.join(__dirname, 'public');
  const targetImage = path.join(publicDir, 'wise2-neon-comic.png');
  const outputImage = path.join(publicDir, 'wise2-neon-comic.png');

  if (!fs.existsSync(targetImage)) {
    console.error('Image not found:', targetImage);
    process.exit(1);
  }

  try {
    const stats = fs.statSync(targetImage);
    const originalSize = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`📸 Compressing image: ${originalSize}MB`);

    // Compress using multiple strategies
    await sharp(targetImage)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .png({
        quality: 75,
        progressive: true,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputImage + '.tmp');

    // Also create WebP version
    await sharp(targetImage)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .webp({
        quality: 75,
        alphaQuality: 100,
        lossless: false,
        effort: 6
      })
      .toFile(path.join(publicDir, 'wise2-neon-comic.webp'));

    // Replace original with compressed version
    fs.renameSync(outputImage + '.tmp', outputImage);

    const newStats = fs.statSync(outputImage);
    const newSize = (newStats.size / (1024 * 1024)).toFixed(2);
    const saved = (((stats.size - newStats.size) / stats.size) * 100).toFixed(1);

    const webpStats = fs.statSync(path.join(publicDir, 'wise2-neon-comic.webp'));
    const webpSize = (webpStats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Compression complete:');
    console.log(`  Original PNG:  ${originalSize}MB`);
    console.log(`  Compressed PNG: ${newSize}MB (saved ${saved}%)`);
    console.log(`  WebP version:   ${webpSize}MB`);
    console.log('\n🚀 Ready for deployment!');
  } catch (error) {
    console.error('❌ Compression failed:', error.message);
    process.exit(1);
  }
}

compressImages();
