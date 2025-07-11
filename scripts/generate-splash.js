// Generate placeholder splash screens for iOS
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS splash screen sizes
const splashSizes = [
  { width: 2732, height: 2048, device: 'iPad Pro 12.9" Landscape' },
  { width: 2048, height: 2732, device: 'iPad Pro 12.9" Portrait' },
  { width: 1668, height: 2388, device: 'iPad Pro 11" Portrait' },
  { width: 1668, height: 2224, device: 'iPad Pro 10.5" Portrait' },
  { width: 1536, height: 2048, device: 'iPad Mini/Air Portrait' },
  { width: 1284, height: 2778, device: 'iPhone 14 Pro Max' },
  { width: 1170, height: 2532, device: 'iPhone 14 Pro' },
  { width: 1242, height: 2688, device: 'iPhone 11 Pro Max' },
  { width: 1125, height: 2436, device: 'iPhone 11 Pro' },
  { width: 750, height: 1334, device: 'iPhone 8' }
];

// Create splash directory
const splashDir = path.join(__dirname, '../public/splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Generate SVG splash screen template
const generateSplashSVG = (width, height) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#3B82F6"/>
  
  <!-- Gradient overlay -->
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad1)"/>
  
  <!-- Logo/Icon -->
  <g transform="translate(${width/2}, ${height/2})">
    <!-- Icon background -->
    <rect x="-150" y="-150" width="300" height="300" rx="60" fill="white" opacity="0.95"/>
    
    <!-- RI Text -->
    <text x="0" y="-20" font-family="-apple-system, system-ui, sans-serif" font-size="120" font-weight="bold" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">
      RI
    </text>
    
    <!-- Engine Text -->
    <text x="0" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="48" font-weight="500" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">
      Engine
    </text>
  </g>
  
  <!-- App name -->
  <text x="${width/2}" y="${height - 200}" font-family="-apple-system, system-ui, sans-serif" font-size="56" font-weight="600" fill="white" text-anchor="middle">
    Realtor Insight Engine
  </text>
  
  <!-- Tagline -->
  <text x="${width/2}" y="${height - 120}" font-family="-apple-system, system-ui, sans-serif" font-size="36" fill="white" opacity="0.9" text-anchor="middle">
    Professional Real Estate Analytics
  </text>
</svg>
`;

// Generate splash screens
splashSizes.forEach(({ width, height, device }) => {
  const svg = generateSplashSVG(width, height);
  const filename = path.join(splashDir, `splash-${width}x${height}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename} for ${device}`);
});

console.log('\nSplash screen generation complete!');
console.log('Note: For production, convert these SVGs to PNG format for better iOS compatibility.');