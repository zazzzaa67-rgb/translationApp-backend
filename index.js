import Groq from "groq"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {marked} from 'marked'
dotenv.config()
const app = express()
app.use(cors({
    origin:"*"
}))
app.use(express.json())
const groq = new Groq({
    apiKey : process.env.GROQ_API_KEY
})
app.post('api/chat', async (req , res) =>{
    try{
        const prompt = req.body.prompt
        const language = req.body.lang
        const systemPrompt = `
    You are a professional, precise, and literal translation assistant. Your sole task is to translate the provided text (word, phrase, or sentence) into ${language}.

    Strict Rules:
    1. Output ONLY the final translated text. 
    2. Do not include any introductions, explanations, notes, or conversational filler (e.g., do not write "Here is your translation:", "Sure!", or "Let me know if you need anything else").
    3. Maintain the original tone, formatting, and punctuation of the input text.
    4. Ensure the translation is clear, accurate, and natural in the target language.

    If the user provides the text but the target language is ambiguous, default to translating it to English.
    `
        if(!prompt) return res.status(400).json({error : "Prompt is required"})
        const response = await groq.chat.completions.create({
        model : "llama-3.3-70b-versatile",
        messages : [
            {role : "system" , content : systemPrompt },
            {role : "user" , content : prompt },
    ]
        }) 
    const aireplay = response.choices[0].messages.content 
    const html = marked.parse(aireplay)
    res.json({replay : html })
    }catch(error){
        console.error(error)
        res.status(500).json({
            error:"Interal server Error"
        })
    }
    })
export default app