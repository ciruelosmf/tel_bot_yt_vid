import { Bot, webhookCallback } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

// Initialize the bot
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);

// Bot handler to store messages in the database
bot.on("message:text", async (ctx) => {
  try {
    // Extract message details
    const { from, text, message_id, date } = ctx.message;

    // Insert message into database
    await sql(`
      INSERT INTO telegram_messages (
        message_id, 
        user_id, 
        username, 
        first_name, 
        last_name, 
        message_text, 
        message_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
    `, [
      message_id,
      from?.id,
      from?.username || null,
      from?.first_name || null,
      from?.last_name || null,
      text,
      new Date(date * 1000) // Convert Unix timestamp to Date
    ]);

    // Respond to the user
    return ctx.reply("Message received and stored successfully!");
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
      error: 'Internal server error'
    });
  }
}