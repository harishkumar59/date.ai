"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageProps = {
  content: string;
  role: 'user' | 'assistant';
  isTyping?: boolean;
  displayedContent?: string;
};

export default function Message({ content, role, isTyping = false, displayedContent = '' }: MessageProps) {
  // Use displayed content (for typewriter effect) if provided, otherwise use full content
  const textToShow = isTyping ? displayedContent : content;

  return (
    <div className={`py-6 ${role === 'assistant' 
      ? 'bg-[rgba(6,27,43,0.4)] backdrop-blur-sm' 
      : 'bg-[rgba(0,10,20,0.5)] backdrop-blur-sm'}`}>
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 mt-1">
            {role === 'assistant' ? (
              <div className="h-10 w-10 rounded-md bg-[rgba(45,226,230,0.1)] border border-[rgba(45,226,230,0.4)] flex items-center justify-center text-[rgba(45,226,230,0.9)]">
                C
              </div>
            ) : (
              <div className="h-10 w-10 rounded-md bg-[rgba(255,154,108,0.1)] border border-[rgba(255,154,108,0.4)] flex items-center justify-center text-[rgba(255,154,108,0.9)]">
                U
              </div>
            )}
          </div>
          
          {/* Message content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-sm font-medium">
              {role === 'assistant' ? (
                <span className="neon-teal">GEMINI</span>
              ) : (
                <span className="neon-orange">You</span>
              )}
            </div>
            <div className={`prose prose-invert max-w-none ${role === 'assistant' ? 'text-[rgba(229,231,235,0.9)]' : 'text-[rgba(255,154,108,0.9)]'}`}>
              {role === 'user' ? (
                <p className="whitespace-pre-wrap">{textToShow}</p>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                >
                  {textToShow}
                </ReactMarkdown>
              )}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-[rgba(45,226,230,0.9)] cursor-blink"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 