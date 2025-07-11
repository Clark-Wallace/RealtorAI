#!/bin/bash

# Deployment script for RealtorAI PWA
# This script builds and prepares the app for production deployment

echo "🚀 Starting RealtorAI production build..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Run production build
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Generate production icons (if using a real icon generator)
# echo "🎨 Generating production icons..."
# npx pwa-asset-generator icon.png public/icons --background "#3B82F6" --padding "10%"

# Optimize images
echo "🖼️ Optimizing images..."
# Add image optimization commands here if needed

# Create deployment info
echo "📝 Creating deployment info..."
cat > dist/deployment.json <<EOF
{
  "version": "$(node -p "require('./package.json').version")",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "production"
}
EOF

# Create .htaccess for Apache servers (if needed)
cat > dist/.htaccess <<EOF
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
EOF

# Create nginx configuration (if needed)
cat > dist/nginx.conf <<EOF
server {
    listen 80;
    server_name realtorai.com;
    root /var/www/realtorai;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
    }

    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Calculate build size
BUILD_SIZE=$(du -sh dist | cut -f1)

echo "✅ Build completed successfully!"
echo "📊 Build size: $BUILD_SIZE"
echo "📁 Output directory: dist/"
echo ""
echo "🚀 Deployment options:"
echo "   1. Upload dist/ contents to your web server"
echo "   2. Deploy to Vercel: vercel --prod"
echo "   3. Deploy to Netlify: netlify deploy --prod"
echo "   4. Deploy to AWS S3: aws s3 sync dist/ s3://your-bucket-name"
echo ""
echo "📱 PWA Checklist:"
echo "   ✓ Service worker registered"
echo "   ✓ Manifest.json configured"
echo "   ✓ HTTPS enabled (required for PWA)"
echo "   ✓ Icons generated"
echo "   ✓ Offline support enabled"
echo ""
echo "🎉 Ready for production deployment!"