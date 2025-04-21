# Today in History - Gemini AI Chat

A beautifully designed web application that presents historical events that happened on a specific date, powered by Google's Gemini AI.

## Features

- Query for historical events by date
- Elegantly designed UI with neon theme
- Typewriter effect for AI responses
- Chat history management
- Responsive design for all devices
- Powered by Google's Gemini 2.0 Flash AI

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, create a `.env` file with your Gemini API key:

```bash
# Gemini
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_FALLBACK_URL=https://generativelanguage.googleapis.com
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploy to Vercel

The easiest way to deploy this app is using Vercel. You can use one of these methods:

#### Method 1: Using the provided deploy script

Make the script executable and run it:

```bash
chmod +x deploy-direct.sh
./deploy-direct.sh
```

#### Method 2: Using Vercel CLI directly

```bash
npm run build
vercel --prod
```

#### Method 3: Connect with GitHub

1. Push your code to GitHub
2. Import your project in the Vercel dashboard
3. Configure environment variables:
   - GEMINI_API_KEY
   - GEMINI_MODEL
   - GEMINI_API_BASE_URL
   - GEMINI_FALLBACK_URL
4. Deploy

### Troubleshooting Deployment

If you encounter deployment issues:

1. Check if your Vercel account is properly set up
2. Verify that all environment variables are correctly set in Vercel
3. Make sure your GitHub repository is connected to Vercel
4. Try deploying with the direct script which sets all environment variables

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini AI](https://ai.google.dev/gemini-api)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)

## License

MIT
