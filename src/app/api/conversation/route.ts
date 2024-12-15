import { NextResponse } from "next/server";
import { getConversation, saveConversations } from "@/app/utils/saveConversations";
import { v4 as uuidv4 } from "uuid";
import { ChatMesage } from "@/app/utils/groqClient"; // Adjust the import path if necessary

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id");

  try {
    // If no ID provided, generate one
    if (!id) {
      id = uuidv4();
    }

    let conversation = await getConversation(id);

    // If conversation not found, create a new default one
    if (!conversation) {
      const defaultConversation: ChatMesage[] = [
        { role: "assistant", content: "Hello! How can I help you today?" },
      ];
      await saveConversations(id, defaultConversation);
      conversation = defaultConversation;
    }

    return NextResponse.json({ id, conversation });
  } catch (error) {
    console.error("Failed to load or create conversation:", error);
    return NextResponse.json({ id: null, conversation: null }, { status: 500 });
  }
}
