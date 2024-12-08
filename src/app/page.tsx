"use client"

import { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [username, setUsername] = useState<string>("asd");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Extract username from initDataUnsafe
      const initDataUnsafe = tg.initDataUnsafe || {};
      setUsername(initDataUnsafe?.user?.username || "Unknown User");
console.log(123123123);
      tg.expand(); // Optional: Expand the WebApp view
    }
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "20px" }}>
      <h1>Welcome to Telegram Mini-App</h1>
      <p>Your username is:</p>
      <h2>{username}</h2>
    </div>
  );
};

export default Home;
