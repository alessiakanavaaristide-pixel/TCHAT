import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. OG Image (1200 x 630) - Perfect for WhatsApp, iMessage, Facebook
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF8F5"/>
  <g transform="translate(240, 185)">
    <!-- Speech bubble outline -->
    <path d="M 50 25 C 20 25, 0 45, 0 85 L 0 175 C 0 215, 20 235, 50 235 L 60 235 L 30 290 C 25 298, 32 305, 40 300 L 110 235 L 180 235 C 210 235, 230 215, 230 175 L 230 85 C 230 45, 210 25, 180 25 Z" 
          fill="none" stroke="#111111" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- Text TCHAT -->
  <text x="540" y="355" font-family="'Georgia', 'Times New Roman', serif" font-size="140" font-weight="700" fill="#111111" letter-spacing="6">TCHAT</text>
  
  <!-- Subtitle -->
  <text x="545" y="415" font-family="'Inter', sans-serif" font-size="28" font-weight="600" fill="#666666" letter-spacing="3">MESSAGES ANONYMES</text>
</svg>
`;

// 2. Favicon / Logo Square (512x512)
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FAF8F5"/>
  <g transform="translate(45, 128)">
    <path d="M 40 20 C 15 20, 0 35, 0 65 L 0 135 C 0 165, 15 180, 40 180 L 45 180 L 25 220 C 22 226, 28 232, 34 228 L 85 180 L 140 180 C 165 180, 180 165, 180 135 L 180 65 C 180 35, 165 20, 140 20 Z" 
          fill="none" stroke="#111111" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="245" y="280" font-family="'Georgia', 'Times New Roman', serif" font-size="94" font-weight="700" fill="#111111" letter-spacing="4">TCHAT</text>
</svg>
`;

async function main() {
  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);

  // Convert to PNG using sharp
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));

  await sharp(Buffer.from(logoSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(Buffer.from(logoSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(Buffer.from(logoSvg))
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated og-image.png, logo.png, favicon.png, apple-touch-icon.png');
}

main().catch(console.error);
