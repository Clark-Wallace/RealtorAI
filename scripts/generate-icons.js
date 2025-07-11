// This script generates placeholder icons for PWA
// In production, replace these with actual app icons

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate SVG icon template
const generateSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="-apple-system, system-ui, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
    RI
  </text>
  <text x="50%" y="65%" font-family="-apple-system, system-ui, sans-serif" font-size="${size * 0.08}" fill="white" text-anchor="middle" dominant-baseline="middle">
    Engine
  </text>
</svg>
`;

// Generate placeholder icons
iconSizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

// Generate additional iOS specific files
const iosSpecificFiles = {
  'apple-touch-icon.png': 180,
  'apple-touch-icon-precomposed.png': 180,
  'apple-touch-icon-120x120.png': 120,
  'apple-touch-icon-152x152.png': 152,
  'apple-touch-icon-180x180.png': 180,
  'badge-72x72.png': 72
};

Object.entries(iosSpecificFiles).forEach(([filename, size]) => {
  const svg = generateSVG(size);
  const filepath = path.join(iconsDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(filepath, svg);
  console.log(`Generated ${filepath}`);
});

// Generate placeholder screenshots
const screenshotSVG = `
<svg width="1170" height="2532" viewBox="0 0 1170 2532" xmlns="http://www.w3.org/2000/svg">
  <rect width="1170" height="2532" fill="#F9FAFB"/>
  <rect x="0" y="0" width="1170" height="120" fill="#FFFFFF"/>
  <text x="585" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="36" font-weight="bold" fill="#1F2937" text-anchor="middle">
    Realtor Insight Engine
  </text>
  <rect x="40" y="160" width="1090" height="200" fill="#3B82F6" rx="20"/>
  <text x="585" y="260" font-family="-apple-system, system-ui, sans-serif" font-size="48" font-weight="600" fill="white" text-anchor="middle">
    Analytics Dashboard
  </text>
</svg>
`;

fs.writeFileSync(path.join(screenshotsDir, 'dashboard.svg'), screenshotSVG);
fs.writeFileSync(path.join(screenshotsDir, 'feedback.svg'), screenshotSVG.replace('Analytics Dashboard', 'Feedback Entry'));

console.log('\nIcon generation complete!');
console.log('Note: For production, replace these SVG placeholders with actual PNG icons.');
console.log('Use a tool like https://realfavicongenerator.net/ to generate proper icons.');