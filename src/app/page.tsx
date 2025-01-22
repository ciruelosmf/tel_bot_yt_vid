// pages/index.tsx
"use client"
import { useState, useEffect } from 'react';
import Chessboard from '../components/Chessboard';
import MatrixBackground from '../components/MatrixBackground';

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function Home() {
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;

      // Ensure WebApp is only initialized on the client side
      if (typeof webapp.ready === 'function') {
        webapp.ready();
      }

      // Set up the MainButton
      webapp.MainButton.setText("Start Game");
      webapp.MainButton.onClick(() => {
        setShowGame(true);
        // Hide the MainButton since the game has started
        webapp.MainButton.hide();
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

      {/* Conditional rendering of the Chessboard in a modal popup */}
      {showGame && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal background */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="relative bg-white p-4 z-50 rounded-lg">
            <button
              onClick={() => setShowGame(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
            <Chessboard />
          </div>
        </div>
      )}
    </div>
  );
}