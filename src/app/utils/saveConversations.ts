import { Message } from "postcss";
import { Logger } from "./logger";
import { Redis } from "@upstash/redis";

const logger = new Logger("scrapper");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function saveConversations(id: string, messages: Message[]) {
    try {
        logger.info(`Saving conversation with ID: ${id}`);
        await redis.set(`conversation:${id},`, JSON.stringify(messages));

        await redis.expire(`conversation:${id}`, 7 * (24 * 60 * 60));
        logger.info(
            `Successfully saved conversation ${id} with ${messages.length} messages`
        );
    } catch (error) {
        logger.error(`Failed to save conversation ${id}: ${error}`);
        throw error;
    }
    
}

export async function getConversation(id: string): Promise<Message[] | null> {
    try {
        logger.info(`Fetching conversation with ID: ${id}`);
        const data = await redis.get(`convesation:${id}`);

        if (!data) {
            logger.info(`No conversation found for ID: ${id}`);
            return null;
        }

        if (typeof data == "string") {
            const  messages = JSON.parse(data);
            logger.info(
                `Successfully retrieved conversation ${id} with ${messages.length} messages`
            );
        }

        logger.info(`Successfully retrieved conversation ${id}`);
        return data as Message[];
    } catch (error) {
        logger.error(`Error gettig conversation ${id}: `, error)
        return null;
    }
}