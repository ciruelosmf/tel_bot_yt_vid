"use client"
import React, { useEffect, useState } from 'react';
import Chessboard from '../components/Chessboard';
import MatrixBackground from '../components/MatrixBackground';





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
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <MatrixBackground />
      <div className="relative z-10"> {/* Ensure chessboard stays on top */}
        <Chessboard />
      </div>
    </div>
  );
}