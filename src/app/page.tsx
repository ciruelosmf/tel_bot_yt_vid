"use client"
import React, { useEffect, useState } from 'react';

export default function TelegramMiniApp() {
  const [userName, setUserName] = useState('');
  const [counter, setCounter] = useState(0);

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

      // Add MainButton for incrementing counter
      webapp.MainButton.text = "Increment Counter";
      webapp.MainButton.onClick(() => {
        setCounter(prevCounter => prevCounter + 1);
      });
      webapp.MainButton.show();

      // Cleanup function to hide the button when the component unmounts
      return () => {
        webapp.MainButton.hide();
      };
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {userName ? `Welcome, ${userName}!` : 'Loading...'}
        </h1>
        <p className="mt-4 text-lg">Counter: {counter}</p>
      </div>
    </div>
  );
}