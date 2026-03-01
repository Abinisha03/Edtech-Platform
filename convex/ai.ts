"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const chat = action({
    args: {
        message: v.string(),
        context: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Initialize OpenAI inside the handler to avoid deployment errors if key is missing during build/analysis
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing OPENAI_API_KEY in environment variables.");
        }

        const openai = new OpenAI({ apiKey });

        try {
            const { message, context } = args;

            const systemPrompt = `You are EduAI, a helpful and knowledgeable educational assistant for students on EduPlatform. 
            Your goal is to help students with their course-related doubts, explain concepts clearly, and guide them towards understanding.
            
            ${context ? `Current Context/Course: ${context}` : ""}
            
            Guidelines:
            - Be encouraging and patient.
            - Use markdown for code snippets and formatting.
            - Keep answers concise but complete.
            - If a question is unrelated to education or the course, gently steer the conversation back to learning.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
            });

            return completion.choices[0].message.content;
        } catch (error: any) {
            console.error("OpenAI API Error:", error);
            throw new Error("Failed to generate AI response. Please try again later.");
        }
    },
});
