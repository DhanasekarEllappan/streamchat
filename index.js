// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const app = express();

// Middleware - IMPORTANT: Add bodyParser first
app.use(cors());
app.use(bodyParser.json()); // This is the crucial line you're missing

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint (No Streaming)
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    try {
        // Get the Gemini model (using gemini-pro for text)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert messages to Gemini's format
        const chat = model.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        });

        const userMessage = messages[messages.length - 1].content;
        
        // Get the full response (no streaming)
        const result = await chat.sendMessage(userMessage);

        // Send back the full result
        res.json({ content: result.text });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
