#!/bin/bash

# Deploy Script for Cloudflare Pages
# Usage: ./deploy.sh

echo "🚀 Starting Deployment Process..."

# 1. Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# 2. Deploy to Cloudflare Pages
# Check if user is logged in or has token
echo "☁️  Deploying to Cloudflare Pages..."
echo "   Project Name: hungsoft"

npx wrangler pages deploy dist --project-name hungsoft

if [ $? -eq 0 ]; then
  echo "✅ Deployment Successful!"
else
  echo "⚠️  Deployment failed. You might need to login."
  echo "   Run: npx wrangler login"
  echo "   Then try again."
fi
