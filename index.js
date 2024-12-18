const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;

const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyAV_Ik6Smsb5KB-mfO4_G2fusc4vgZa7fc");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});


app.post('/generate', async (req, res) => {
    try {
        const { topic, difficulty, totalquestions } = req.body;

        if (!topic || !difficulty || !totalquestions) {
            return res.status(400).json({ error: 'Topic, difficulty, and totalquestions are required.' });
        }

        const jsonData = {
            prompt: `Generate ${totalquestions} MCQs on ${topic} with ${difficulty} difficulty. 
                     Provide JSON with an array of questions. Each question should have 
                     a question, options, and an answer.`
        };

        const result = await model.generateContent(jsonData.prompt);
        let rawResponse = result.response.text();

        console.log('Raw response from Gemini:', rawResponse);

        // Clean and parse the response
        rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(rawResponse);

        // Ensure parsedResponse.questions is an array
        if (!Array.isArray(parsedResponse.questions)) {
            throw new Error('Invalid response format: "questions" is not an array');
        }

        res.json(parsedResponse.questions); // Send only the array to the frontend
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});






app.get('/', (req, res) => {
    res.send('Welcome to the Gemini API integration with Node.js');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
