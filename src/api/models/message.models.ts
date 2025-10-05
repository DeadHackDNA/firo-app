export interface Message {
    id: string,
    conversationId: string,
    sender: string,
    content: string,
    createdAt: string,
}
export interface Conversation {
    id: string,
    userId: string,
    startTime: string,
    endTime: string | null,
    messages: Message[],
}
export interface ConversationResponse {
    userId: string,
    totalConversations: number,
    totalMessages: number,
    conversations: Conversation[],
}

export interface BotMessage {
    id: string,
    conversationId: string,
    sender: string,
    content: string,
    intent: string | null,
    entities: any[] | null,
    sentiment: string | null,
    createdAt: string,
}
export interface SendMessageResponse {
    botMessage: BotMessage,
}