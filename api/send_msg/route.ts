// /api/send-message.ts

import { Bot } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";

// Initialize the bot
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);

// For testing purposes, hardcode your Telegram user ID
const TEST_USER_IDS = [7152017538]; // <-- Replace 123456789 with your actual Telegram user ID

// Optionally, define a secret token directly for testing
const SECRET_TOKEN = 'my_test_secret_token'; // Replace 'my_test_secret_token' with any string you choose

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      // Check for the secret token (you can skip this during testing if you wish)
      //  const authToken = req.query.token;

      // Optionally, you can comment out this block during testing
      //   if (authToken !== SECRET_TOKEN) {
      //    res.status(401).json({ error: 'Unauthorized' });
      //    return;
     //   }

      // Send message to each user
      for (const userId of TEST_USER_IDS) {
        try {
          await bot.api.sendMessage(userId, "This is a test scheduled message.");
        } catch (err) {
          console.error(`Failed to send message to ${userId}:`, err);
        }
      }

      res.status(200).json({ success: true, message: 'Messages sent' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Unhandled error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}