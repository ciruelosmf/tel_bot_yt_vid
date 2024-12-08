"use client"

import { useEffect, useState } from 'react';

const WebApp = () => {
  const [username, setUsername] = useState<string>('Unknown User');

  useEffect(() => {
    // Check if we're in the Telegram WebApp context
    const urlParams = new URLSearchParams(window.location.search);
    const initData = urlParams.get('init_data'); // Get initData from the URL

    if (initData) {
      try {
        // Decode base64 initData (Telegram sends it base64 encoded)
        const decodedData = atob(initData); // Decode base64 to string
        const parsedData = JSON.parse(decodedData); // Parse the JSON string
        
        // Extract the username (if available)
        setUsername(parsedData?.user?.username || 'Unknown User');
      } catch (error) {
        console.error('Error decoding initData:', error);
        setUsername('Error loading user data');
      }
    }
  }, []);

  return (
    <div>
      <h1>Hello, {username}!</h1>
    </div>
  );
};

export default WebApp;
