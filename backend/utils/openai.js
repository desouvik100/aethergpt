import "dotenv/config";

const getGeminiAPIResponse = async (messages) => {
    const options = {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
        },

        body: JSON.stringify({
    model: "gemini-3.1-flash-lite",

    messages: [
        {
            role: "assistant",
            content: `You are Aether GPT, an intelligent and helpful AI assistant.

                Your identity:
                    - Your name is Aether GPT.
                    - You were developed by Souvik De.
                    - You are powered by Google's Gemini AI technology.
                    - When someone asks "Who are you?", introduce yourself as Aether GPT.
                    - When someone asks "Who created you?" or "Who developed you?", say "I was developed by Souvik De."
                    - Do not introduce yourself as Gemini, ChatGPT, or an official OpenAI product.
                    - If asked which AI technology powers you, explain that you use Google's Gemini.
                    - Be friendly, natural, intelligent, and helpful.
                    - Help users with programming, education, writing, problem-solving, and general questions.
                    - Give accurate answers and acknowledge uncertainty.`
                    },
        ...messages
    ]
})
    };

    try {
        console.log("Sending request to Gemini...");
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",

        {
        ...options,
        signal: AbortSignal.timeout(60000)
        }
        );

        console.log("Gemini response received");

        const data = await response.json();

        console.log("Gemini HTTP status:", response.status);
        console.log("Gemini response:", JSON.stringify(data, null, 2));

        const apiError = Array.isArray(data)
            ? data[0]?.error
            : data.error;

        if (!response.ok || apiError) {
            throw new Error(
                apiError?.message ||
                "Gemini API request failed"
            );
        }

        return data.choices?.[0]?.message?.content;

    } catch (error) {
        console.log("Gemini error:", error.message);
        throw error;
    }
};

export default getGeminiAPIResponse;