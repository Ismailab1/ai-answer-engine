import { NextResponse } from "next/server";
import { getGroqResponse } from "@/app/utils/groqClient";
import { scrapeURL, urlPattern } from "@/app/utils/scraper";
import { saveConversations } from "@/app/utils/saveConversations";
import { ChatMesage } from "@/app/utils/groqClient";

export async function POST(req: Request) {
  try {
    const { message, messages, conversationId } = (await req.json()) as {
      message: string;
      messages: ChatMesage[];
      conversationId: string;
    };

    console.log("Message received:", message);
    console.log("Messages:", messages);
    console.log("Conversation ID:", conversationId);

    const urlMatches = message.match(urlPattern);
    const extractedUrl = urlMatches && urlMatches[0]; // The first matched URL string

    let scrappedContent = "";
    if (extractedUrl) {
      console.log("URL found:", extractedUrl);
      const scrapperResponse = await scrapeURL(extractedUrl);
      console.log("Scrapped content", scrappedContent);
      if (scrapperResponse) {
        scrappedContent = scrapperResponse.content;
      }
    }

    const userQuery = message
      .replace(scrappedContent ? scrappedContent[0] : "", "")
      .trim();

    const userPrompt = `
        Answer my question: "${userQuery}"

        Based on the following content:
        <content>
          ${scrappedContent}
        </content>
      `;

    // Add the user's query (prompt) as a new user message
    const llmMessages: ChatMesage[] = [
      ...messages,
      {
        role: "user",
        content: userPrompt,
      },
    ];

    console.log("LLM Messages before response:", llmMessages);

    const response = await getGroqResponse(llmMessages);

    console.log("In route.ts post response");

    // Add the assistant's response to the conversation
    const updatedConversation: ChatMesage[] = [
      ...llmMessages,
      {
        role: "assistant",
        content: response,
      },
    ];

    // Save the updated conversation
    if (conversationId) {
      await saveConversations(conversationId, updatedConversation);
      console.log(
        `Conversation ${conversationId} saved with ${updatedConversation.length} messages`
      );
    } else {
      console.warn("No conversationId provided, conversation not saved.");
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.log("Error in chat route:", error);
    return NextResponse.json({ message: "Error: ", error }, { status: 500 });
  }
}
