import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    let message = "";
    let context = "";

    try {
        const body = await req.json();
        message = body.message;
        context = body.context;

        // Check for Groq API Key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("[AI_FORUM_ERROR] Missing GROQ_API_KEY environment variable.");
            return new NextResponse("Missing Groq API Key", { status: 500 });
        }

        const groq = new Groq({
            apiKey: apiKey,
        });

        if (!message) {
            return new NextResponse("Message is required", { status: 400 });
        }

        const systemPrompt = `You are EduAI, a helpful and knowledgeable educational assistant for students on EduPlatform. 
        Your goal is to help students with their course-related doubts, explain concepts clearly, and guide them towards understanding.
        
        ${context ? `Current Context/Course: ${context}` : ""}
        
        Guidelines:
        - Be encouraging and patient.
        - Use markdown for code snippets and formatting.
        - Keep answers concise but complete.
        - If a question is unrelated to education or the course, gently steer the conversation back to learning.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            model: "llama-3.1-8b-instant",
        });

        return NextResponse.json({
            response: completion.choices[0]?.message?.content || "No response generated."
        });

    } catch (error: any) {
        console.error("[AI_FORUM_ERROR]", error);

        // Always fallback to mock response for ANY error to keep the demo/UI working
        // This handles: Keys, Network, etc.
        return NextResponse.json({
            response: `**(System Fallback from Groq)** \n\nI'm currently unable to reach my main brain, but here is a response based on my local knowledge:\n\n` +
                generateSmartMockResponse(message, context)
        });
    }
}

function generateSmartMockResponse(query: string, course?: string) {
    const lowerQuery = query.toLowerCase();

    // 1. Check for specific keywords
    if (lowerQuery.includes("nextjs") || lowerQuery.includes("next.js")) {
        return "Based on your question about **Next.js**, here is a quick overview:\n\nNext.js is a React framework that enables functionality such as server-side rendering and generating static websites for React based web applications.\n\n**Key Features:**\n- **File-system Routing**: Pages are created by adding files to the `app/` directory.\n- **Server Components**: Render components on the server for better performance.\n- **Data Fetching**: Simplified data fetching methods.\n\n*(Note: This is an offline response because the Groq API key is unavailable/limited.)*";
    }

    if (lowerQuery.includes("react")) {
        return "Regarding **React**, here are the core concepts:\n\nReact is a JavaScript library for building user interfaces.\n\n**Main Concepts:**\n1. **Components**: The building blocks of your UI.\n2. **Props**: How data is passed between components.\n3. **State**: How components manage their own data (e.g., `useState`).\n4. **Hooks**: Functions that let you hook into React state and lifecycle features.\n\n*(Note: This is an offline response because the Groq API key is unavailable/limited.)*";
    }

    if (lowerQuery.includes("python")) {
        return "Here is some information about **Python**:\n\nPython is a high-level, interpreted programming language known for its readability.\n\n**Useful features:**\n- **Lists**: Ordered, mutable collections.\n- **Dictionaries**: Key-value pairs.\n- **Functions**: Define reusable blocks of code with `def`.\n\n*(Note: This is an offline response because the Groq API key is unavailable/limited.)*";
    }

    // 2. Generic structure if no keywords match
    const prefix = course && course !== "All Courses" ? `[Context: ${course}] ` : "";
    return `${prefix}That's an excellent question about "${query}". \n\nSince I'm currently running in **Offline Mode** (due to API limits), here is a general structured approach to solving this:\n\n1.  **Define the Problem**: Break down the core concepts involved.\n2.  **Research**: Look for specific documentation related to your query.\n3.  **Implementation**: Try coding a small example.\n4.  **Testing**: Verify your solution with different inputs.\n\n*(Please check your Groq API key quota to enable full AI capabilities.)*`;
}
