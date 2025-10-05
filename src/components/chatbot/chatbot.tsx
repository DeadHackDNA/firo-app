import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { sendMessage} from "../../api/sendMessage.ts";
import { getConversations } from "../../api/getConversations.ts";

import type {Message, Conversation, SendMessageResponse} from "../../api/models/message.models.ts";

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(true);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setMessages([
                {
                    id: "init",
                    conversationId: "none",
                    sender: "bot",
                    content: "👋 Welcome! Please log in to load your conversations.",
                    createdAt: new Date().toISOString(),
                },
            ]);
            setEnabled(false);
            setLoading(false);
            return;
        }

        const fetchConversations = async () => {
            try {
                const conversations: Conversation[] = await getConversations(userId);
                const firstConversation = conversations?.[0];

                if (firstConversation) {
                    const orderedMessages = [...(firstConversation.messages ?? [])].reverse();
                    setCurrentConversationId(firstConversation.id);
                    setMessages(orderedMessages);
                } else {
                    setMessages([
                        {
                            id: "init",
                            conversationId: "none",
                            sender: "bot",
                            content: "Hello! What would you like to discuss today?",
                            createdAt: new Date().toISOString(),
                        },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching user conversations:", error);
                setMessages([
                    {
                        id: "error",
                        conversationId: "none",
                        sender: "bot",
                        content: "❌ Failed to load your conversations.",
                        createdAt: new Date().toISOString(),
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations().then();
    }, []);

    const handleSend = async (text: string) => {
        console.log(text);
        const userId = localStorage.getItem("userId");
        if (!text.trim() || !userId) return;
        const userMessage: Message = {
            id: crypto.randomUUID(),
            conversationId: currentConversationId ?? "temp",
            sender: "user",
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        try {
            const response:SendMessageResponse = await sendMessage(userId, text);
            const botMessage = response.botMessage;
            setMessages((prev) => [...prev, {
                id: botMessage.id,
                conversationId: botMessage.conversationId,
                sender: "bot",
                content: botMessage.content,
                createdAt: botMessage.createdAt,
            }]);
            console.log("Bot response:", botMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-gray-500">
                Loading conversations...
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full"
        >
            <Card className="flex flex-col h-full rounded-xl border-0 shadow-none py-2 px-2">
                <CardContent className="flex flex-col h-full p-0 rounded-xl overflow-hidden">
                    <ChatHeader />
                    <ChatMessages messages={messages} />
                    <ChatInput onSend={handleSend}/>
                </CardContent>
            </Card>
        </motion.div>
    );
}
