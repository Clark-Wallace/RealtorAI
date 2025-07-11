# Deployment Guide

This guide covers deploying the Realtor Insight Engine to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Production domain with HTTPS (required for PWA)
- API keys configured in `.env.local`

## Build for Production

First, create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel offers the easiest deployment with automatic HTTPS and global CDN.

#### One-time Setup:
```bash
npm i -g vercel
vercel login
```

#### Deploy:
```bash
# From project root
vercel --prod
```

#### Environment Variables:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.example`

### 2. Netlify

#### One-time Setup:
```bash
npm i -g netlify-cli
netlify login
```

#### Deploy:
```bash
# Initialize (first time only)
netlify init

# Deploy
netlify deploy --prod --dir=dist
```

#### Environment Variables:
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Site Settings → Environment Variables
3. Add all variables from `.env.example`

### 3. AWS S3 + CloudFront

#### Prerequisites:
- AWS CLI configured
- S3 bucket created
- CloudFront distribution set up

#### Deploy Script:
```bash
#!/bin/bash
# deploy-aws.sh

# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "sw.js" \
  --exclude "manifest.json"

# Upload HTML with no-cache
aws s3 sync dist/ s3://your-bucket-name \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "sw.js" \
  --include "manifest.json"

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 4. GitHub Pages

#### Setup:
1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/realtor-ai",
  "scripts": {
    "predeploy": "npm run build",
    "deploy-gh": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy-gh
```

### 5. Docker Deployment

#### Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run:
```bash
docker build -t realtor-ai .
docker run -p 80:80 realtor-ai
```

## Post-Deployment Checklist

### 1. Verify PWA Installation
- [ ] Open site in mobile browser
- [ ] Check for install prompt
- [ ] Install and test offline functionality
- [ ] Verify all icons load correctly

### 2. Test Core Features
- [ ] Voice recording works
- [ ] Transcription functions properly
- [ ] Data persists after refresh
- [ ] All navigation works

### 3. Performance
- [ ] Run Lighthouse audit (target 90+ scores)
- [ ] Check bundle size (< 500KB initial)
- [ ] Verify lazy loading works
- [ ] Test on slow 3G connection

### 4. Security
- [ ] HTTPS enabled
- [ ] API keys not exposed
- [ ] CSP headers configured
- [ ] CORS properly set up

### 5. Monitoring
- [ ] Error tracking connected
- [ ] Analytics working
- [ ] Uptime monitoring configured
- [ ] Backup system in place

## Environment-Specific Configurations

### Production Environment Variables

```env
# Production API
VITE_API_BASE_URL=https://api.yourdomain.com/v1
VITE_API_KEY=prod_key_here

# Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Features
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_AI_TRANSCRIPTION=true
VITE_ENABLE_PROPERTY_SEARCH=true
VITE_ENABLE_CRM_INTEGRATION=true
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
```

### Staging Environment

Use a separate deployment with staging configuration:

```env
VITE_API_BASE_URL=https://staging-api.yourdomain.com/v1
VITE_MOCK_API=true
VITE_DEBUG_MODE=true
```

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
        
    - name: Deploy to Vercel
      run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Rollback Procedures

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel alias set [deployment-url] [production-domain]
```

### Netlify
1. Go to Deploys tab in Netlify dashboard
2. Find previous working deployment
3. Click "Publish deploy"

### AWS S3
Keep previous builds:
```bash
# Before deploying, backup current version
aws s3 sync s3://your-bucket-name s3://your-bucket-name-backup-$(date +%Y%m%d)
```

## Troubleshooting

### PWA Not Installing
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker registration
- Clear browser cache

### Voice Recording Not Working
- Check microphone permissions
- Ensure HTTPS (required for getUserMedia)
- Test in supported browsers

### Offline Mode Issues
- Clear service worker cache
- Check cache strategies in sw.js
- Verify offline.html exists

### Performance Issues
- Enable text compression
- Check image sizes
- Verify code splitting works
- Use CDN for static assets

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/yourusername/realtor-ai/issues)
- Review deployment logs
- Contact support@realtorai.com