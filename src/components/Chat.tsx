"use client";

import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';

type MessageType = {
  content: string;
  role: 'user' | 'assistant';
  id: string; // Add an ID for tracking purposes
};

export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // For typewriter effect - reducing from 30ms to 5ms per character for much faster typing
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [fullContent, setFullContent] = useState('');
  const typingSpeedRef = useRef(5); // Milliseconds per character - much faster now

  // Also add support for typing multiple characters at once for even faster effect
  const charsPerTickRef = useRef(3); // Type 3 characters at a time

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
    
    // Add user message to chat
    const userMessageId = generateId();
    const userMessage: MessageType = { content, role: 'user', id: userMessageId };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsLoading(true);
    
    try {
      // Create a message array without IDs for the API
      const messagesForApi = [...messages, userMessage].map(({ content, role }) => ({ content, role }));
      
      console.log('Sending messages to API:', JSON.stringify(messagesForApi));
      
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesForApi }),
      });
      
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
              <h2 className="text-lg font-medium text-gray-200 mb-2">Welcome to Google Gemini</h2>
              <p className="text-gray-400">
                I&apos;m an AI assistant powered by Google&apos;s Gemini. Ask me anything, and I&apos;ll do my best to help you.
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-md text-sm">
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
              <div className="py-5 bg-gray-800/40 backdrop-blur-sm">
                <div className="mx-auto max-w-4xl px-5 md:px-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-orange-900/60 flex items-center justify-center text-orange-300">
                        C
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && !isLoading && !typingMessageId && (
              <div className="py-3 px-5 md:px-8 mx-auto max-w-4xl">
                <div className="p-3 bg-red-900/50 text-red-200 rounded-md text-sm">
                  Error: {error}
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