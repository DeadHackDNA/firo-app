import HttpClient from "./http-client.ts";
import type {ConversationResponse} from "./models/message.models.ts";

export async function getConversations(userId: string) {
    try {
        const response =
            await HttpClient.get<ConversationResponse>(`/messages/users/${userId}`);
        return response.data.conversations;
    } catch (error) {
        console.log("Error fetching messages:", error);
        return [];
    }
}