import { Bot, webhookCallback, Context  } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);

// Initialize the bot
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);













// Define an enum for registration steps
enum RegistrationStep {
  START = 'start',
  NAME = 'name',
  LAST_NAME = 'lastName',
  LOCATION = 'location',
  EXPERIENCE = 'experience',
  COMPLETED = 'completed'
}

// User data interface
interface UserRegistrationData {
  telegram_id : number;
  current_step : RegistrationStep;
  userData: {
    name?: string;
    last_name ?: string;
    location?: string;
    years_of_practice ?: number;
  };
}

// Bot flow handler
async function handleRegistrationFlow(ctx: Context, userRegistration: UserRegistrationData) {
  // Get the message text
  const messageText = ctx.message?.text;

  // Switch based on current registration step
  switch (userRegistration.current_step) {

    case RegistrationStep.START:
      await ctx.reply('Welcome! What is your first name?');
      // Update step in your database
      await updateUserRegistrationStep(
        ctx.from!.id, 
        RegistrationStep.NAME
      );
      break;



    case RegistrationStep.NAME:
      // Validate name
      if (!messageText || messageText.length < 2) {
        await ctx.reply('Please provide a valid name.');
        return;
      }


      // Save name to your database
      await updateUserData(ctx.from!.id, {
        name: messageText
      });

      await ctx.reply(`Nice to meet you, ${messageText}! What is your last name?`);
      

      // Update to next step
      await updateUserRegistrationStep(
        ctx.from!.id, 
        RegistrationStep.LAST_NAME
      );
      break;







    case RegistrationStep.LAST_NAME:
      // Similar validation and step progression
      if (!messageText || messageText.length < 2) {
        await ctx.reply('Please provide a valid last name.');
        return;
      }

      await updateUserData(ctx.from!.id, {
        last_name: messageText
      });

      await ctx.reply('Great! What is your current city or location?');
      
      await updateUserRegistrationStep(
        ctx.from!.id, 
        RegistrationStep.LOCATION
      );
      break;






    // Continue with similar patterns for other steps
    case RegistrationStep.LOCATION:
      // Location validation and progression
      if (!messageText) {
        await ctx.reply('Please provide a valid location.');
        return;
      }

      await updateUserData(ctx.from!.id, {
        location: messageText
      });

      await ctx.reply('How many years of practice do you have?');
      
      await updateUserRegistrationStep(
        ctx.from!.id, 
        RegistrationStep.EXPERIENCE
      );
      break;

    case RegistrationStep.EXPERIENCE:
      const years_of_practice = parseInt(messageText || '0');
      
      if (isNaN(years_of_practice) || years_of_practice < 0) {
        await ctx.reply('Please provide a valid number of years.');
        return;
      }

      await updateUserData(ctx.from!.id, {
        years_of_practice
      });

      // Final step - complete registration
      await ctx.reply('Registration Complete!');
      
      await updateUserRegistrationStep(
        ctx.from!.id, 
        RegistrationStep.COMPLETED
      );

      // Optionally trigger next actions like finding practice spots
      // await sendPracticeRecommendations(ctx, yearsOfPractice);
      break;

    case RegistrationStep.COMPLETED:
      await ctx.reply('You have already completed registration. How can I help you?');
      break;
  }
}






























// Database interaction functions (you'll implement these with your DB)
async function updateUserRegistrationStep(
  telegramId: number, 
  step: RegistrationStep
) {

  console.log(1)
  // Implement with your database connection
  // Example with Prisma:
  // await prisma.user.update({
  //   where: { telegramId },
  //   data: { currentStep: step }
  // })
}




























async function updateUserData(
  telegramId: number,
  data: Partial<UserRegistrationData['userData']>
) {
  try {
    // Build dynamic query based on provided data
    const updateFields: string[] = [];
    const values: any[] = [telegramId];
    let parameterIndex = 2; // Start from $2 since $1 is telegramId

    // Add each field that exists in the data object
    if (data.name !== undefined) {
      updateFields.push(`name = $${parameterIndex}`);
      values.push(data.name);
      parameterIndex++;
    }

    if (data.last_name !== undefined) {
      updateFields.push(`last_name = $${parameterIndex}`);
      values.push(data.last_name);
      parameterIndex++;
    }

    if (data.location !== undefined) {
      updateFields.push(`location = $${parameterIndex}`);
      values.push(data.location);
      parameterIndex++;
    }

    if (data.years_of_practice  !== undefined) {
      updateFields.push(`years_of_practice = $${parameterIndex}`);
      values.push(data.years_of_practice );
      parameterIndex++;
    }

    // If no fields to update, return early
    if (updateFields.length === 0) {
      return;
    }

    // Construct and execute the query
    const query = `
      UPDATE user_registrations 
      SET ${updateFields.join(', ')}
      WHERE telegram_id = $1
      RETURNING *
    `;

    const result = await sql(query, values);
    
    return result[0];
  } catch (error) {
    console.error('Error updating user data:', error);
    throw new Error('Failed to update user data');
  }
}























async function getUserRegistration(telegramId: number): Promise<UserRegistrationData | null> {
  try {
    const result = await sql`
      SELECT 
        telegram_id,
        current_step,
        name,
        last_name,
        location,
        years_of_practice
      FROM user_registrations 
      WHERE telegram_id = ${telegramId}
    `;

    // If no user found, return null
    if (result.length === 0) {
      return null;
    }

    // Transform database row to UserRegistrationData format
    const row = result[0];
    
    return {
      telegram_id: row.telegram_id,
      current_step: row.current_step as RegistrationStep,
      userData: {
        name: row.name || undefined,
        last_name: row.last_name || undefined,
        location: row.location || undefined,
        years_of_practice: row.years_of_practice || undefined
      }
    };
  } catch (error) {
    console.error('Error fetching user registration:', error);
    throw new Error('Failed to fetch user registration');
  }
}












 






async function createUserRegistration(
  userRegistration: {
    telegram_id: number;
    current_step: RegistrationStep;
    userData: {
      name?: string;
      last_name?: string;
      location?: string;
      years_of_practice?: number;
    };
  }
) {
  try {
    const result = await sql`
      INSERT INTO user_registrations (
        telegram_id,
        current_step,
        name,
        last_name,
        location,
        years_of_practice
      ) VALUES (
        ${userRegistration.telegram_id},
        ${userRegistration.current_step},
        ${userRegistration.userData.name || null},
        ${userRegistration.userData.last_name || null},
        ${userRegistration.userData.location || null},
        ${userRegistration.userData.years_of_practice || null}
      )
      RETURNING *
    `;

    // Return the first row of the result
    return result[0];
  } catch (error) {
    // Check for duplicate key violation
    if ((error as any)?.code === '23505') { // PostgreSQL unique violation code
      throw new Error('User registration already exists');
    }
    
    console.error('Error creating user registration:', error);
    throw new Error('Failed to create user registration');
  }
}























 

 // Start command to reset or begin registration
bot.command('start', async (ctx) => {
  // Reset user to initial registration state
  await updateUserRegistrationStep(
   ctx.from!.id, 
  RegistrationStep.START
  );
  
  await ctx.reply('Let\'s start your registration process!');
});










// Main bot message handler
bot.on('message', async (ctx) => {

  const telegram_id = ctx.from!.id;
  
  // Fetch or create initial registration state
  let userRegistration = await getUserRegistration(telegram_id);
  
  if (!userRegistration) {
    // Automatically create initial registration state
    userRegistration = {
      telegram_id,
      current_step: RegistrationStep.START,
      userData: {}
    };
    
    // Save to database
    await createUserRegistration(userRegistration);
    
    // Welcome message
    await ctx.reply(`
      Hi there! I see this is your first interaction. 
      Let's get you registered! What is your first name?
    `);
  }

  // Proceed with registration flow
  await handleRegistrationFlow(ctx, userRegistration);
});






 







////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////


 

 




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