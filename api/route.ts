import { Bot, webhookCallback } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

// Initialize the bot
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);






// Validate and parse product input
function parseProductInput(input: string) {
  const cleanInput = input.replace('/addproduct', '').trim();
  
  const parts = cleanInput.split(',').map(part => 
    part.trim().replace(/^"|"$/g, '')
  );
  
  if (parts.length !== 4) {
    throw new Error('Invalid input format. Use: /addproduct "Product Name", "Description", "price", "quantity"');
  }
  
  const [name, description, priceStr, quantityStr] = parts;
  
  const price = parseFloat(priceStr);
  const quantity = parseInt(quantityStr);
  
  if (isNaN(price) || isNaN(quantity)) {
    throw new Error('Price and quantity must be valid numbers');
  }
  
  return { name, description, price, quantity };
}







// Handler for adding products
bot.command("addproduct", async (ctx) => {
  try {
    const input = ctx.message?.text;

    // Use optional chaining and destructuring carefully
    const from = ctx.from;
    const message_id = ctx.message?.message_id;
    const date = ctx.message?.date;

    if (!input || !from || !message_id || !date) {
      throw new Error('Invalid message context');
    }
    
    const { name, description, price, quantity } = parseProductInput(input);
    
    await sql(`
      INSERT INTO telegram_messages (
        message_id, 
        user_id, 
        username, 
        first_name, 
        last_name, 
        product_name, 
        product_description, 
        product_price, 
        product_quantity, 
        message_date,
        message_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `, [
      message_id,
      from?.id,
      from?.username || null,
      from?.first_name || null,
      from?.last_name || null,
      name, // Product name
      description, // Product description
      price, // Product price
      quantity, // Product quantity
      new Date(date * 1000), // Convert UNIX timestamp to JavaScript Date
      'product' // Message type
    ]);
    
    await ctx.reply(`Product "${name}" added successfully!\n` +
      `Details:\n` +
      `- Description: ${description}\n` +
      `- Price: $${price.toFixed(2)}\n` +
      `- Quantity: ${quantity}`);
  } catch (error) {
    if (error instanceof Error) {
      await ctx.reply(error.message);
    } else {
      await ctx.reply("Sorry, there was an error adding the product.");
    }
  }
});



// Bot handler - simply echo back the received message
bot.on("message:text", async (ctx) => {
  try {
    return ctx.reply("Use el comando '/añadir' para gregar un producto al stock, formato {nombre de producto}, {descripción}, {precio},{cantidad}. ATENCIÓN: SEPARAR POR COMAS CADA ITEM ");
  } catch (error) {
    console.error('Error de mensaje:', error);
    return ctx.reply("Hubo un error, intente de nuevo.");
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