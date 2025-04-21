import { NextResponse } from 'next/server';

export const runtime = "edge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
const API_BASE_URL = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const FALLBACK_URL = process.env.GEMINI_FALLBACK_URL || 'https://generativelanguage.googleapis.com';

const API_URL = `${API_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const FALLBACK_API_URL = `${FALLBACK_URL}/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Check if an API endpoint is reachable
async function isEndpointReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    return false;
  }
}

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
    
    const { messages }: { messages: Message[] } = await req.json();
    
    // Ensure we're focusing on the date-based query, which should be the last message
    const dateQuery = messages[messages.length - 1].content;
    
    // Add a system instruction to enhance the historical context response
    const historyPrompt = `
You are a history expert AI assistant. A user is asking about historical events that happened on a specific date.

Query: "${dateQuery}"

Respond with 3-5 significant historical events that occurred on this date throughout history. For each event:
1. Include the year
2. Provide a brief, engaging description of the event
3. Focus on diverse events from different time periods and categories (politics, science, arts, etc.)
4. Present the information in a clear, engaging format
5. Add interesting details that make the history come alive

Make your response engaging, educational, and well-formatted.
`;
    
    console.log("Sending to Gemini:", historyPrompt);
    
    // Create request body for Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: historyPrompt
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
    
    // Create a controller to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Try primary URL first
      console.log("Trying primary API URL:", API_URL.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));
      
      // Fetch from Gemini API with timeout handling
      let response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // If primary URL fails, try fallback URL
      if (!response.ok) {
        console.log("Primary URL failed, trying fallback URL:", FALLBACK_API_URL.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));
        
        response = await fetch(FALLBACK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
      }
      
      // Clear the timeout if the request completes before the timeout
      clearTimeout(timeoutId);
      
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
        text = 'Sorry, I couldn\'t find any significant historical events for that date.';
      }
      
      console.log("Received from Gemini:", text.substring(0, 100) + '...');
      
      // Return the proper response format
      return NextResponse.json({ text });
      
    } catch (fetchError) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Handle network or timeout errors
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          error: "The request to the Gemini API timed out. Please try again later." 
        }, { status: 504 });
      }
      
      // Generate a fallback historical event for the date
      // This only works as a temporary solution when the API is unreachable
      const dateParts = dateQuery.match(/(\w+) (\d+)/);
      let fallbackResponse = '';
      
      if (dateParts && dateParts.length >= 3) {
        const month = dateParts[1];
        const day = dateParts[2];
        
        fallbackResponse = `Here are some historical events for ${month} ${day}:\n\n` +
          `1912: The RMS Titanic sank in the North Atlantic Ocean after colliding with an iceberg.\n\n` +
          `1775: The American Revolutionary War began with the Battles of Lexington and Concord.\n\n` +
          `1989: The Tiananmen Square protests began in China.\n\n` +
          `(Note: These are example events and may not actually correspond to ${month} ${day}. The API connection failed, so I'm providing generic examples.)`;
      } else {
        fallbackResponse = "Sorry, I couldn't connect to the historical events database. Please check your internet connection and try again.";
      }
      
      return NextResponse.json({ text: fallbackResponse }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Error in Gemini API:', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request. Please check your internet connection and try again." },
      { status: 500 }
    );
  }
} 