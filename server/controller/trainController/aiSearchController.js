import express from 'express'
import OpenAI from 'openai'

dotenv.config();

const openai = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY,
});

const openAi = new OpenAIApi(config);

const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'Suggest me trains from Delhi to Mumbai for 25 July',
      },
    ],
})

console.log(response.choices[0].message.content);