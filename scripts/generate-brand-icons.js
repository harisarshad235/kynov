const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 1. High-Contrast Premium Brand Badge SVG for Favicons, Google Search, and Mobile Home Screens
const brandBadgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <radialGradient id="kynov-bg-glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#141C48" />
      <stop offset="60%" stop-color="#090E24" />
      <stop offset="100%" stop-color="#040612" />
    </radialGradient>
    <linearGradient id="kynov-border-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366F1" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#2D3FEA" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#141B66" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="kynov-mark-grad" x1="20" y1="260" x2="280" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2D3FEA" />
      <stop offset="45%" stop-color="#4F62FF" />
      <stop offset="80%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#818CF8" />
    </linearGradient>
  </defs>

  <!-- Squircle Base with Deep Visual Contrast (Works in both Dark & Light Search Results) -->
  <rect x="12" y="12" width="488" height="488" rx="116" fill="url(#kynov-bg-glow)" stroke="url(#kynov-border-grad)" stroke-width="16" />

  <!-- Inner Ambient Glow Ring -->
  <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="#2D3FEA" stroke-width="2" stroke-opacity="0.35" />

  <!-- Official Kynov Monogram Mark Centered -->
  <g transform="translate(106, 116) scale(1.1)">
    <g transform="translate(14, 28)">
      <!-- Main outer structure and inner cutouts -->
      <path 
        d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z" 
        fill="url(#kynov-mark-grad)" 
        fill-rule="evenodd" 
      />
      <!-- Lower diagonal leg -->
      <path 
        d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z" 
        fill="url(#kynov-mark-grad)" 
      />
    </g>
  </g>
</svg>`;

// Pure Node.js Standard ICO container builder (combines multiple PNG buffers into a single .ico file)
function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  let offset = 6 + count * 16;
  const dirEntries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // image offset in file
    dirEntries.push(entry);
    offset += buf.length;
  }
  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function run() {
  console.log('Writing brand badge SVGs...');
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), brandBadgeSvg, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), brandBadgeSvg, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../app/icon.svg'), brandBadgeSvg, 'utf8');

  const badgeBuf = Buffer.from(brandBadgeSvg);

  // Rasterize crisp PNG sizes for Google Favicon bot, PWA, and Apple Touch
  const pngSizes = [
    { size: 16, file: 'public/icon-16.png' },
    { size: 32, file: 'public/icon-32.png' },
    { size: 48, file: 'public/icon-48.png' },     // Exact Google Favicon unit
    { size: 96, file: 'public/icon-96.png' },     // 2x Google Favicon unit
    { size: 180, file: 'public/apple-touch-icon.png' },
    { size: 192, file: 'public/icon-192.png' },   // Standard Android PWA
    { size: 512, file: 'public/icon-512.png' },   // High-res PWA & Schema.org
    { size: 512, file: 'app/icon.png' },          // Next.js automatic icon
  ];

  for (const { size, file } of pngSizes) {
    const dest = path.join(__dirname, '..', file);
    await sharp(badgeBuf)
      .resize(size, size)
      .png()
      .toFile(dest);
    console.log(`Generated ${file} (${size}x${size})`);
  }

  // Generate multi-resolution favicon.ico containing 16x16, 32x32, and 48x48
  console.log('Generating multi-resolution favicon.ico...');
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(badgeBuf).resize(s, s).png().toBuffer();
    icoBuffers.push(buf);
  }
  const icoData = createIco(icoBuffers, icoSizes);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoData);
  fs.writeFileSync(path.join(__dirname, '../app/favicon.ico'), icoData);
  console.log('Generated public/favicon.ico and app/favicon.ico successfully.');

  // High-resolution OpenGraph preview card (1200x630)
  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#070A18" />
    <defs>
      <radialGradient id="bgGlow" cx="20%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#2D3FEA" stop-opacity="0.30" />
        <stop offset="100%" stop-color="#070A18" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="cornerGlow" cx="90%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#4F62FF" stop-opacity="0.20" />
        <stop offset="100%" stop-color="#070A18" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="ogGrad" x1="15" y1="260" x2="285" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#2D3FEA" />
        <stop offset="45%" stop-color="#4F62FF" />
        <stop offset="100%" stop-color="#818CF8" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bgGlow)" />
    <rect width="1200" height="630" fill="url(#cornerGlow)" />

    <!-- Subtle grid overlay -->
    <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105" />
      <line x1="0" y1="210" x2="1200" y2="210" />
      <line x1="0" y1="315" x2="1200" y2="315" />
      <line x1="0" y1="420" x2="1200" y2="420" />
      <line x1="0" y1="525" x2="1200" y2="525" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
    </g>

    <!-- Kynov Monogram Mark Badge -->
    <g transform="translate(100, 165)">
      <rect x="0" y="0" width="280" height="280" rx="64" fill="#0D1432" stroke="#2D3FEA" stroke-width="4" stroke-opacity="0.5" />
      <g transform="translate(-10, -10)">
        <g transform="translate(14, 28)">
          <path 
            d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z" 
            fill="url(#ogGrad)" 
            fill-rule="evenodd" 
          />
          <path 
            d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z" 
            fill="url(#ogGrad)" 
          />
        </g>
      </g>
    </g>

    <!-- Typography -->
    <text x="430" y="275" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="96" font-weight="800" fill="#FFFFFF" letter-spacing="-0.04em">Kynov</text>
    <text x="435" y="340" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="32" font-weight="600" fill="#818CF8" letter-spacing="-0.01em">Agile Velocity &amp; Sprint Tracking</text>
    <text x="435" y="405" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">High-performance Kanban boards, sprint backlogs, velocity sparklines,</text>
    <text x="435" y="440" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">and enterprise-grade team collaboration.</text>

    <!-- Badge -->
    <rect x="435" y="475" width="220" height="38" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="455" cy="494" r="5" fill="#10B981" />
    <text x="470" y="500" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#F1F5F9">Next-Gen Agile Engine</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'));
  console.log('Generated public/og-image.png (1200x630)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
