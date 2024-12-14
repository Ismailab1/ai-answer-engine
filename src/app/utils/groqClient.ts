import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing or empty.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


interface ChatMesage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function getGroqResponse(message: string) {
    const messages: ChatMesage[] = [
        {role: "system", content: "You are an academic expert, you aways cite your sources and base your responses on the context that you have been provided."},
        {role: "user", content: message},
    ];

    console.log("Starting groq api request");
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages
    })
    console.log("Recieved groq api request", response);

    return response.choices[0].message.content;
}