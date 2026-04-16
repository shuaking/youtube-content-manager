import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const assets = [
  // Hero images
  { url: 'https://www.languagereactor.com/images/home_v2_webp/girl_desk-small.webp', path: 'images/hero/girl_desk-small.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/girl_desk-big.webp', path: 'images/hero/girl_desk-big.webp' },

  // Icons
  { url: 'https://www.languagereactor.com/images/home/chrome.svg', path: 'images/icons/chrome.svg' },

  // Feature screenshots
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/netflix.webp', path: 'images/features/netflix.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/youtube.webp', path: 'images/features/youtube.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/books-and-websites.webp', path: 'images/features/books-and-websites.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/bilingual-subtitles.webp', path: 'images/features/bilingual-subtitles.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/precise-playback-controls.webp', path: 'images/features/precise-playback-controls.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/dict_and_examples.webp', path: 'images/features/dict_and_examples.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/world-map.webp', path: 'images/features/world-map.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/what-to-learn.webp', path: 'images/features/what-to-learn.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/smart-highlighting.webp', path: 'images/features/smart-highlighting.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/phrasepump.webp', path: 'images/features/phrasepump.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/export-to-anki.webp', path: 'images/features/export-to-anki.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/aria.webp', path: 'images/features/aria.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/fsi-dli.webp', path: 'images/features/fsi-dli.webp' },
  { url: 'https://www.languagereactor.com/images/home_v2_webp/thumbs_resized/phone-tablet.png', path: 'images/features/phone-tablet.png' },
  { url: 'https://www.languagereactor.com/images/tt.png', path: 'images/features/tt.png' }
];

async function downloadAsset(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const fullPath = join(publicDir, outputPath);

    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, Buffer.from(buffer));

    console.log(`✓ Downloaded: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error.message);
  }
}

async function downloadAll() {
  console.log(`Downloading ${assets.length} assets...`);

  // Download in batches of 4
  for (let i = 0; i < assets.length; i += 4) {
    const batch = assets.slice(i, i + 4);
    await Promise.all(batch.map(asset => downloadAsset(asset.url, asset.path)));
  }

  console.log('\nDownload complete!');
}

downloadAll();
