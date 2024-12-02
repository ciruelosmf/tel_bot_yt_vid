 
import { NextResponse } from 'next/server';

 
import { headers } from 'next/headers'
 
import { neon } from '@neondatabase/serverless';



interface ClerkEmail {
  id: string;
  email_address: string;
  verification_status: string; // Adjust based on actual schema
}




export async function POST(req: Request) {
   
  


    // store payload in DB (users)

    const sql = neon(`${process.env.DATABASE_URL}`);

    

    if (1) {
      try {
        // Extract primary email address
 
    
        await sql(
            `
            INSERT INTO users (external_user_id, username, email, image_url, credits) 
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
         

            ]
        );
      } catch (error) {
        console.error("Error inserting user into database:", error);
    }
    }
    






    return new Response('Webhook received', { status: 200 })
  }







