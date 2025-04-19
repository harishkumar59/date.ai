import { NextResponse } from 'next/server';

export const runtime = "edge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Define message type
type Message = {
  role: string;
  content: string;
};

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
      console.error('Missing Gemini API key in environment variables');
      return NextResponse.json(
        { error: "API key is not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    console.log("Using Gemini model:", MODEL);
    console.log("API URL:", API_URL.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));

    const { messages }: { messages: Message[] } = await req.json();
    
    // Format messages to fit Gemini's API structure
    // Take only the latest user message
    const lastUserMessage = messages.filter((m: Message) => m.role === 'user').pop()?.content || '';
    
    // Build context from previous messages if needed
    let conversationHistory = '';
    if (messages.length > 1) {
      conversationHistory = messages.slice(0, -1)
        .map((m: Message) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
    }
    
    // Create a properly formatted prompt for Gemini
    const finalPrompt = conversationHistory 
      ? `${conversationHistory}\n\nHuman: ${lastUserMessage}\nAssistant:`
      : `Human: ${lastUserMessage}\nAssistant:`;
    
    console.log("Sending to Gemini:", finalPrompt);
    
    // Create request body for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: finalPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    };
    
    // Fetch from Gemini API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      try {
        // Try to parse as JSON if possible for more details
        const errorData = JSON.parse(errorText);
        console.error('Detailed error:', JSON.stringify(errorData));
        
        if (response.status === 403) {
          return NextResponse.json({ 
            error: `Gemini API error: 403 Forbidden. This usually indicates an issue with your API key or permissions.`, 
            details: errorData 
          }, { status: response.status });
        }
        
        return NextResponse.json({ 
          error: `Gemini API error: ${response.status}`, 
          details: errorData 
        }, { status: response.status });
      } catch (e) {
        // If not JSON, return as plain text
        return NextResponse.json({ 
          error: `Gemini API error: ${response.status}`, 
          details: errorText 
        }, { status: response.status });
      }
    }
    
    const data = await response.json();
    
    // Extract the response text based on the Gemini API response structure
    let text = '';
    if (data.candidates && data.candidates.length > 0) {
      if (data.candidates[0].content?.parts && data.candidates[0].content.parts.length > 0) {
        text = data.candidates[0].content.parts[0].text || '';
      }
    }
    
    // Clean up the response if needed
    if (text.startsWith('Assistant:')) {
      text = text.substring('Assistant:'.length).trim();
    }
    
    if (!text) {
      text = 'Sorry, I couldn\'t generate a response.';
    }
    
    console.log("Received from Gemini:", text.substring(0, 100) + '...');
    
    // Return the proper response format
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in Gemini API:', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
} 