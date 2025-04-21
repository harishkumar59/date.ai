"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Chat, { ChatHistoryItem, MessageType } from './Chat';

// Storage key for chat history
const STORAGE_KEY = 'today_in_history_chats';

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contentOpacity, setContentOpacity] = useState(1);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  
  // Create a new chat - defined with useCallback so it can be used in useEffect
  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    setCurrentMessages([]);
    
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const storedHistory = localStorage.getItem(STORAGE_KEY);
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory) as ChatHistoryItem[];
          setChatHistory(parsedHistory);
          
          // If there's history, set the most recent chat as current
          if (parsedHistory.length > 0) {
            // Sort by last updated
            const sortedHistory = [...parsedHistory].sort(
              (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            );
            setCurrentChatId(sortedHistory[0].id);
            setCurrentMessages(sortedHistory[0].messages);
          } else {
            // If history exists but is empty, create a new chat
            createNewChat();
          }
        } else {
          // If no history at all, create a new chat
          createNewChat();
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // If error loading history, create a new chat as fallback
        createNewChat();
      }
    };
    
    loadChatHistory();
  }, [createNewChat]);
  
  // Save a chat to history
  const saveChat = useCallback((chat: ChatHistoryItem) => {
    setChatHistory(prev => {
      // Check if this chat already exists in history
      const chatIndex = prev.findIndex(c => c.id === chat.id);
      
      let updatedHistory;
      if (chatIndex >= 0) {
        // Update existing chat
        updatedHistory = [...prev];
        updatedHistory[chatIndex] = chat;
      } else {
        // Add new chat
        updatedHistory = [...prev, chat];
      }
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
      
      return updatedHistory;
    });
  }, []);
  
  // Load an existing chat
  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setCurrentMessages(chat.messages);
      
      // Close sidebar on mobile after selecting a chat
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };
  
  // Delete a chat
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    setChatHistory(prev => {
      const updatedHistory = prev.filter(c => c.id !== chatId);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
      
      // If we deleted the current chat, select another one
      if (chatId === currentChatId && updatedHistory.length > 0) {
        const newCurrentChat = updatedHistory[0];
        setCurrentChatId(newCurrentChat.id);
        setCurrentMessages(newCurrentChat.messages);
      } else if (updatedHistory.length === 0) {
        // If no chats left, create a new empty one
        createNewChat();
      }
      
      return updatedHistory;
    });
  };
  
  // Handle responsive behavior by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    // Fade out content first when collapsing
    if (sidebarOpen) {
      setContentOpacity(0);
      setTimeout(() => {
        setSidebarOpen(false);
        setContentOpacity(1);
      }, 150);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-slate-800 relative">
      {/* Sidebar Toggle Button - Mobile */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-slate-700 text-primary shadow-lg"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Left Sidebar */}
      <div 
        className={`sidebar-transition absolute md:relative z-10 h-full
          ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} 
          flex-col surface m-3 mr-0 overflow-hidden flex`}
      >
        {/* Inner sidebar content with fade effect */}
        <div className={`sidebar-content-fade ${sidebarOpen ? 'opacity-100' : 'opacity-0'} w-full h-full flex flex-col`}>
          {/* Sidebar Toggle Button - Desktop */}
          <button 
            onClick={toggleSidebar}
            className="hidden md:block absolute top-4 right-4 p-1.5 rounded-lg bg-slate-700 text-primary hover:bg-slate-600 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
            
          {/* Logo */}
          <div className="p-5 border-b border-slate-600 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-3 subtle-border">
              <span className="font-bold text-2xl text-primary">H</span>
            </div>
            <div className="font-bold text-xl text-primary tracking-wide">TIMELINE</div>
          </div>
          
          {/* New Chat Button */}
          <div className="px-4 pt-4">
            <button 
              onClick={createNewChat}
              className="w-full p-3 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-primary flex items-center justify-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>
          
          {/* Tabs */}
          <div className="p-4 text-sm">
            <div className="mb-2">
              <div className="px-3 py-2 border-b border-slate-600 font-medium text-primary">Saved History</div>
            </div>
          </div>
          
          {/* Saved Dates Section */}
          <div className="flex-1 overflow-y-auto p-3">
            {chatHistory.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-4">
                No history yet. Start a new chat!
              </div>
            ) : (
              /* Chat History Items */
              <div className="space-y-2">
                {chatHistory
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => loadChat(chat.id)}
                    className={`p-3 rounded-lg transition-colors cursor-pointer flex items-center justify-between group
                      ${currentChatId === chat.id 
                        ? 'bg-primary/20 hover:bg-primary/30 border border-primary/30' 
                        : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-slate-800 flex items-center justify-center mr-3 border border-slate-600">
                        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
                          <rect x="4" y="8" width="16" height="0" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <div className="text-sm text-slate-200 truncate font-medium">
                          {chat.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {new Date(chat.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="p-1 rounded-md bg-slate-800/50 hover:bg-red-900/50 text-slate-400 hover:text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Powered by indicator */}
          <div className="p-3 m-2 rounded-lg bg-slate-700 border border-slate-600 text-center">
            <div className="text-sm text-slate-300">
              Powered by Gemini AI
            </div>
          </div>
          
          {/* User Info */}
          <div className="p-3 border-t border-slate-600 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-500">
                <span className="text-primary">H</span>
              </div>
              <div className="ml-3 text-sm text-slate-200">Harish Kumar Kallepalli</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col p-3 sidebar-transition ${sidebarOpen ? 'md:ml-0' : 'md:ml-3'}`}>
        {/* Sidebar Toggle Button for Collapsed State */}
        {!sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex mb-3 self-start p-2 rounded-lg bg-slate-700 text-primary hover:bg-slate-600 transition-colors items-center gap-2"
            aria-label="Expand sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Show Timeline</span>
          </button>
        )}
      
        {/* Header */}
        <div className="flex items-center justify-center py-6 mb-3">
          <h1 className="text-3xl font-bold">
            <span className="text-secondary mr-2">●</span>
            <span className="gradient-text">Today in History</span>
          </h1>
        </div>
        
        {/* Chat Content */}
        <div className="flex-1 overflow-hidden surface">
          <Chat 
            onSave={saveChat} 
            currentChatId={currentChatId} 
            initialMessages={currentMessages} 
          />
        </div>
      </div>
    </div>
  );
} 