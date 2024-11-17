
// This is boilerplate code, simple tg bot


import { Bot, webhookCallback } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";


// Initialize the bot
const token = process.env.BOT_TOKEN; // ADD BOT_TOKEN env variable in Vercel dashboard
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);
// Bot handler - simply echo back the received message
bot.on("message:text", async (ctx) => {
  try {
    return ctx.reply("I am a TG bot, and You wrote: " +  ctx.message.text);
  } catch (error) {
    console.error('Error handling message:', error);
    return ctx.reply("Sorry, there was an error processing your message. Please try again.");
  }
});
// Create the webhook callback handler
const handleWebhook = webhookCallback(bot, "http");
// Handler for Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      // Handle the webhook
      await handleWebhook(req, res);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Unhandled error:', e);
    res.status(500).json({ 
      error: 'Internal server error',
 
    });
  }
}