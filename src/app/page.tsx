"use client"
import React, { useEffect, useState } from 'react';

export default function TelegramMiniApp() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      
      // Ensure WebApp is only initialized on client side
      if (typeof webapp.ready === 'function') {
        webapp.ready();
      }

      // Get user data
      const user = webapp.initDataUnsafe.user;
      if (user) {
        setUserName(user.username || user.username || 'Telegram User');
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {userName ? `Welcome, ${userName}!` : 'Loading...'}
        </h1>
      </div>
    </div>
  );
}