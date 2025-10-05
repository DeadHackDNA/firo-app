import httpClient from "./http-client.ts";
import type {SendMessageResponse} from "./models/message.models.ts";

interface RequestBody {
    userId: string,
    sender: string,
    content: string,
    intent: string,
    entities: any[],
    sentiment: string
}

export async function sendMessage(userId: string, message: string): Promise<SendMessageResponse> {
    try {
        const requestBody: RequestBody = {
            userId,
            sender: "USER",
            content: message,
            intent: "",
            entities: [],
            sentiment: "neutral",
        }
        const botResponse =
            await httpClient.post<SendMessageResponse>("/messages", requestBody);
        return botResponse.data;
    } catch (error) {
        console.log("Error sending message:",error);
        throw error;
    }
}