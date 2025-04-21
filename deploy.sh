#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --yes

echo "Deployment complete! Check the Vercel dashboard for your deployment URL." 