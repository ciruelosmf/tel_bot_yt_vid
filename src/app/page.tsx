"use client"

import { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [username, setUsername] = useState<string>("aa");

  useEffect(() => {
    console.log("Checking Telegram context...");

    if (typeof window !== "undefined") {
      console.log("Window is defined.");

      if (window.Telegram?.WebApp) {
        console.log("Telegram WebApp context detected!");

        const tg = window.Telegram.WebApp;
        const initDataUnsafe = tg.initDataUnsafe || {};
        console.log("initDataUnsafe:", initDataUnsafe);

        setUsername(initDataUnsafe?.user?.username || "Unknown User");
        tg.expand();
      } else {
        console.log("Telegram WebApp context NOT detected.");
      }
    } else {
      console.log("Window is undefined.");
    }
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "20px" }}>
      <h1>Welcome to Telegram Mini-App</h1>
      <p>Your username is:</p>
      <h2> {username || "This app must be opened via Telegram to display your username."} </h2>
    </div>
  );
};

export default Home;
