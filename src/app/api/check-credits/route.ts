// \src\app\api\create_eulogy\route.ts
import { NextResponse } from 'next/server';
 
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.X_AI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(request: Request): Promise<NextResponse> {
 

  try {
 
 

    // Construct a message for the OpenAI API based on form data
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are Mark, an expert cynical." },
      { role: "user", content: `Generate an cynical eulogy ` },
    ];

    // Make the OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages,
    });

    // Extract the response message
    const responseMessage = completion.choices[0]?.message?.content || "No responsse generated";

    // Respond with the generated content
    return NextResponse.json({ eulogy: responseMessage }, { status: 200 });
  } catch (error) {
    console.error('Error generating eulogy:', error);
    return NextResponse.json({ error: 'An error occurred while generating the eulogy' }, { status: 500 });
  }
}
