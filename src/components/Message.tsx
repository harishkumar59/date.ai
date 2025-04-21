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
    <div className={`py-4 ${role === 'assistant' ? 'bg-slate-800/80' : 'bg-slate-900/60'}`}>
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 mt-1">
            {role === 'assistant' ? (
              <div className="h-9 w-9 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-primary">
                H
              </div>
            ) : (
              <div className="h-9 w-9 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-secondary">
                U
              </div>
            )}
          </div>
          
          {/* Message content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-sm font-medium">
              {role === 'assistant' ? (
                <span className="text-primary">Historian</span>
              ) : (
                <span className="text-secondary">You</span>
              )}
            </div>
            <div className={`prose prose-invert max-w-none ${role === 'assistant' ? 'text-slate-200' : 'text-amber-100'}`}>
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
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary cursor-blink"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 