"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TelegramMiniApp() {
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if Telegram WebApp API is available
    if (window.Telegram && window.Telegram.WebApp) {
      const webapp = window.Telegram.WebApp;
      
      // Initialize the webapp
      webapp.ready();
      
      // Get user data
      const user = webapp.initDataUnsafe.user;
      if (user) {
        setUserName(user.first_name || 'Telegram User');
        setIsConnected(true);
      }
    }
  }, []);

  const handleButtonClick = () => {
    // Example interaction with Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.showAlert('Button clicked!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">
          {isConnected ? `Hello, ${userName}!` : 'Connecting to Telegram...'}
        </h1>
        
        <button 
          onClick={handleButtonClick}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          disabled={!isConnected}
        >
          {isConnected ? 'Interact' : 'Waiting for connection'}
        </button>
        
        {/* Optional: Small Telegram-style footer */}
        <footer className="mt-6 text-sm text-gray-500">
          Powered by Telegram Mini App
        </footer>
      </div>
    </div>
  );
}