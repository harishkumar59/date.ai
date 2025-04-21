#!/bin/bash

# Ensure we have the latest Vercel CLI
echo "Installing latest Vercel CLI..."
npm install -g vercel

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf .next

# Build the application
echo "Building Next.js application..."
npm run build

# Deploy directly to Vercel with explicit environment variables
echo "Deploying to Vercel..."
vercel deploy --prod \
  --env GEMINI_API_KEY=AIzaSyA-f1ZAcNvUpH4jBuwqLJaBzTDvnQWC8q8 \
  --env GEMINI_MODEL=gemini-2.0-flash \
  --env GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta \
  --env GEMINI_FALLBACK_URL=https://generativelanguage.googleapis.com \
  --yes

echo "Deployment complete! Check the Vercel dashboard for your deployment URL." 