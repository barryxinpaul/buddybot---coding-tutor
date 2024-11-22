"use server";
"use strict";

import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai'; // Use the OpenAI client


// Load environment variables
dotenv.config({path: '../../.env.local'});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the .env file
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hello from BuddyBot!',
  });
});

// Chat route
app.post('/', async (req, res, next) => {
    try {
      // Extract the prompt from the request body
      const { prompt } = req.body;
  
      // Validate the prompt
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {"role": "system", content: "You are an assistant that will create easy to undestand and follow code. You will provide the full code and small explination at the end."},
        { role: 'user', content: prompt }, // Proper chat input format
      ],
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });



// After receiving the response from OpenAI API
const botResponse = response.choices[0].message.content;
console.log('Bot Response before sending to client:', botResponse);

// Send the response back to the client
res.status(200).send({
  bot: botResponse,
});
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).send({ error: error.message || 'Something went wrong' });
  }
});

// Start the server
const PORT = 5001.;
app.listen(PORT, () => {
  console.log(`AI server started on http://localhost:${PORT}`);
});
