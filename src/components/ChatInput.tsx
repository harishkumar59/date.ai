"use client";

import React, { useState } from 'react';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
};

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [selectedDate, setSelectedDate] = useState('');

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateSelect = () => {
    if (!selectedDate) return;
    
    const formattedDate = formatDate(selectedDate);
    const message = `What happened on ${formattedDate} in history?`;
    onSendMessage(message);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
    const message = `What happened on ${formattedToday} in history?`;
    onSendMessage(message);
  };

  return (
    <div className="p-4">
      <div className="mx-auto">
        <div className="relative rounded-xl bg-slate-700 border border-slate-600 p-5 shadow-lg">
          {/* Date selection UI */}
          <div className="flex flex-col space-y-5">
            <div className="text-slate-200 text-center font-medium">
              Select a date to discover historical events
            </div>
            
            <div className="flex items-center justify-center space-x-3 flex-wrap gap-y-3">
              <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-800 border border-slate-600 text-slate-200 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              
              <button
                onClick={handleDateSelect}
                disabled={!selectedDate || isLoading}
                className={!selectedDate || isLoading ? "btn-primary opacity-50 cursor-not-allowed" : "btn-primary"}
              >
                Discover
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-slate-600 flex-1"></div>
              <span className="text-slate-400 text-sm uppercase tracking-wider">or</span>
              <div className="h-px bg-slate-600 flex-1"></div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleTodayClick}
                disabled={isLoading}
                className={isLoading ? "btn-secondary opacity-50 cursor-not-allowed" : "btn-secondary"}
              >
                Today in History
              </button>
            </div>
          </div>

          <div className="absolute right-4 bottom-3 flex items-center">
            <span className="text-slate-400 text-xs font-semibold tracking-wider">Gemini 2.0 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
} 