import { Bot, webhookCallback } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

// Initialize the bot
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);






 


// Function to add user to the database
async function addUserWith2Credits(userId: number, username?: string) {
  try {
    const result = await sql`
      INSERT INTO telegram_users (user_id, username, credits)
      VALUES (${userId}, ${username || null}, 2)
      ON CONFLICT (user_id) DO UPDATE
      SET 
        username = COALESCE(EXCLUDED.username, telegram_users.username),
        credits = GREATEST(telegram_users.credits, 2),
        last_active_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error('Could not add user to database');
  }
}








// Start command handler
bot.command("start", async (ctx) => {
  try {
    // Extract user information
    const from = ctx.from;
    if (!from) {
      return ctx.reply("Unable to retrieve user information.");
    }

    // Add user to database
    const user = await addUserWith2Credits(from.id, from.username);

    // Construct welcome message
    const welcomeMessage = `
*Welcome to the AI Image Description Bot!* 🤖📸

You have been granted *2 initial credits* to try out the service.

Your user details:
- User ID: \`${from.id}\`
- Username: @${from.username || 'N/A'}
- Current Credits: *${user.credits}*

Send me an image, and I'll describe it for you!
    `;

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error in /start command:', error);
    await ctx.reply("Sorry, there was an error creating your account.");
  }
});

















// Add this function to retrieve user credits
async function getUserCredits(userId: number) {
  try {
    const result = await sql`
      SELECT credits 
      FROM telegram_users 
      WHERE user_id = ${userId}
    `;
    
    return result[0]?.credits ?? 0;
  } catch (error) {
    console.error('Error retrieving user credits:', error);
    throw new Error('Could not retrieve credits');
  }
}






// Add this command handler
bot.command("credits", async (ctx) => {
  try {
    // Extract user information
    const from = ctx.from;
    if (!from) {
      return ctx.reply("Unable to retrieve user information.");
    }

    // Get user credits
    const credits = await getUserCredits(from.id);

    // Construct credits message with some personality
    const creditsMessage = `
*Your Credit Balance* 💳

You currently have: *${credits}* credits remaining 

- Use these credits to get AI descriptions of your images
- Low on credits? Check out our subscription plans!
    `;

    await ctx.reply(creditsMessage, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error in /credits command:', error);
    await ctx.reply("Sorry, there was an error checking your credits.");
  }
});



















 


// Bot handler - simply echo back the received message
bot.on("message:text", async (ctx) => {
  try {
    return ctx.reply("Use /start to begin ");
  } catch (error) {
    console.error('Error :', error);
    return ctx.reply(" error.");
  }
});





// Create the webhook callback handler
const handleWebhook = webhookCallback(bot, "http");

// Handler for Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
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