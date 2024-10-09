// server.js

import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store threads and messages in-memory (for demonstration purposes)
const threads = {};

app.post('/api/threads', (req, res) => {
  try {
    const threadId = 'thread_' + Math.random().toString(36).substring(2, 15);
    threads[threadId] = []; // Initialize an empty message list for this thread
    res.json({ threadId });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

app.post('/api/run', async (req, res) => {
  const { message, thread_id } = req.body;
  try {
    if (!threads[thread_id]) {
      return res.status(400).json({ error: 'Invalid thread ID' });
    }

    // Get previous messages from the thread
    const previousMessages = threads[thread_id];

    // Add the new user message
    previousMessages.push({ role: 'user', content: message });

    // Call the assistant using Chat Completion API
    const completion = await openai.ChatCompletion.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if available
      messages: previousMessages,
    });

    const assistantReply = completion.choices[0].message;

    // Add assistant's reply to the thread
    previousMessages.push(assistantReply);

    // Send the latest assistant message back to the client
    res.json({ messages: [assistantReply] });
  } catch (error) {
    console.error('Error running assistant:', error);
    res.status(500).json({ error: 'Failed to run assistant' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
