"use client";

import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';

export type MessageType = {
  content: string;
  role: 'user' | 'assistant';
  id: string;
};

export type ChatHistoryItem = {
  id: string;
  title: string;
  date: string; // Format: ISO string
  messages: MessageType[];
  lastUpdated: string; // Format: ISO string
};

type ChatProps = {
  onSave: (chatHistory: ChatHistoryItem) => void;
  currentChatId: string | null;
  initialMessages?: MessageType[];
};

export default function Chat({ onSave, currentChatId, initialMessages = [] }: ChatProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // For typewriter effect - reducing from 30ms to 5ms per character for much faster typing
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [fullContent, setFullContent] = useState('');
  const typingSpeedRef = useRef(5); // Milliseconds per character - much faster now

  // Also add support for typing multiple characters at once for even faster effect
  const charsPerTickRef = useRef(3); // Type 3 characters at a time

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      // Extract title from first message if it's a date query
      let title = 'New Chat';
      const firstUserMessage = messages.find(m => m.role === 'user');
      
      if (firstUserMessage) {
        const dateMatch = firstUserMessage.content.match(/What happened on (.+) in history\?/);
        if (dateMatch && dateMatch[1]) {
          title = dateMatch[1];
        }
      }
      
      const chatHistory: ChatHistoryItem = {
        id: currentChatId,
        title,
        date: new Date().toISOString(),
        messages,
        lastUpdated: new Date().toISOString()
      };
      
      onSave(chatHistory);
    }
  }, [messages, currentChatId, onSave]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedContent]);

  // Typewriter effect - updated to type multiple characters at once
  useEffect(() => {
    if (!typingMessageId || !fullContent) return;
    
    if (displayedContent.length >= fullContent.length) {
      // We're done typing
      setTimeout(() => {
        // Update the message with full content and stop typing effect
        setMessages(prev => 
          prev.map(msg => 
            msg.id === typingMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
        setTypingMessageId(null);
        setDisplayedContent('');
        setFullContent('');
      }, 100);
      return;
    }
    
    // Add multiple characters at a time
    const timeoutId = setTimeout(() => {
      setDisplayedContent(prev => {
        const remainingChars = fullContent.length - prev.length;
        const charsToAdd = Math.min(charsPerTickRef.current, remainingChars);
        return prev + fullContent.substr(prev.length, charsToAdd);
      });
    }, typingSpeedRef.current);
    
    return () => clearTimeout(timeoutId);
  }, [typingMessageId, fullContent, displayedContent]);
  
  // Generate a unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (content: string) => {
    // Reset error state
    setError(null);
    
    // Store the query for potential retries
    setLastQuery(content);
    
    // Add user message to chat
    const userMessageId = generateId();
    const userMessage: MessageType = { content, role: 'user', id: userMessageId };
    setMessages((prev) => [...prev, userMessage]);
    
    await sendToAPI(content);
  };
  
  const handleRetry = async () => {
    if (!lastQuery) return;
    
    setError(null);
    await sendToAPI(lastQuery);
  };
  
  const sendToAPI = async (content: string) => {
    setIsLoading(true);
    
    try {
      // Create a modified message to instruct Gemini to provide historical information
      const historyInstruction = "You're an AI assistant specialized in providing fascinating historical information. The user wants to know what happened on a specific date in history. Provide 3-5 significant historical events that occurred on this date throughout history. For each event, include the year and a brief description of the event. Make your response engaging and informative.";
      
      // Create a message array with history instruction
      const messagesForApi = [
        { content: historyInstruction, role: 'user' },
        { content, role: 'user' }
      ];
      
      console.log('Sending messages to API:', JSON.stringify(messagesForApi));
      
      // Implement fetch with retry logic
      let retries = 2;
      let response = null;
      let fetchError = null;
      
      while (retries >= 0 && !response) {
        try {
          // Add a small delay before retries
          if (retries < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          response = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: messagesForApi }),
          });
          
          break; // If successful, exit the loop
        } catch (error) {
          fetchError = error;
          retries--;
          console.log(`API call failed, retries left: ${retries}`);
        }
      }
      
      // If all retries failed, throw the last error
      if (!response) {
        throw fetchError || new Error("Failed to connect to the API after multiple attempts");
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || `API returned ${response.status}`);
      }
      
      // Check if data contains a text response
      if (data && data.text) {
        // Create a new assistant message
        const assistantMessageId = generateId();
        const assistantMessage: MessageType = { 
          content: '', // Start with empty content for typewriter effect
          role: 'assistant', 
          id: assistantMessageId 
        };
        
        // Add the empty message to the chat
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Setup typewriter effect
        setTypingMessageId(assistantMessageId);
        setFullContent(data.text);
        setDisplayedContent('');
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        // Fallback for any other unexpected response format
        console.error('Unexpected response format:', data);
        throw new Error('Received an unexpected response format');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          content: `Sorry, I encountered an error. Please try again. (Error: ${errorMessage})`,
          role: 'assistant',
          id: generateId()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 mx-auto mb-5 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-slate-200 mb-3">Today in History</h2>
              <p className="text-slate-400 mb-3">
                Select a date to discover fascinating historical events that occurred on that day throughout history.
              </p>
              <p className="text-xs text-slate-500">
                Powered by Google&apos;s Gemini AI
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                isTyping={message.id === typingMessageId}
                displayedContent={message.id === typingMessageId ? displayedContent : undefined}
              />
            ))}
            {isLoading && (
              <div className="py-4 bg-slate-800/80">
                <div className="mx-auto max-w-4xl px-4 md:px-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-9 w-9 rounded-lg bg-slate-700 flex items-center justify-center text-primary">
                        H
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex space-x-2 items-center mt-3">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && !isLoading && !typingMessageId && (
              <div className="py-3 px-4 md:px-6 mx-auto max-w-4xl">
                <div className="p-3 bg-red-900/30 text-red-200 border border-red-700 rounded-lg text-sm flex flex-col gap-3">
                  <div>Error: {error}</div>
                  <button 
                    onClick={handleRetry}
                    className="py-2 px-4 rounded-md bg-red-800 hover:bg-red-700 text-red-200 self-start transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !!typingMessageId} />
    </div>
  );
} 