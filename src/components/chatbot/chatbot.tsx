import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { sendMessage } from "../../api/sendMessage.ts";
import { useViewContext } from "../../hooks/use-view-context";

import type { Message, SendMessageResponse } from "../../api/models/message.models.ts";
import { cachedFireLocations, cachedFireLocationsPredicted } from "../../lib/cesium-fire.ts";

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const viewContext = useViewContext();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName") || "User";
        
        // CRÍTICO: SIEMPRE empezar con chat limpio - JAMÁS cargar historial
        if (!userId) {
            setMessages([
                {
                    id: "init_" + Date.now(),
                    conversationId: "temp",
                    sender: "bot",
                    content: "Welcome to FIRO Fire Assistant! Please log in to start a fresh conversation.",
                    createdAt: new Date().toISOString(),
                },
            ]);
        } else {
            // SIEMPRE mensaje de bienvenida fresco - SIN historial previo
            setMessages([
                {
                    id: "welcome_" + Date.now(),
                    conversationId: "temp",
                    sender: "bot",
                    content: `Hello ${userName}! Welcome to FIRO Fire Assistant! I can see what you're viewing on the 3D map and provide context-aware analysis. I can help you understand fire patterns, analyze current fire activity in your view, explain why certain areas might not have fires, and provide risk assessments. Try searching for a location and I'll analyze what you see. How can I assist you today?`,
                    createdAt: new Date().toISOString(),
                },
            ]);
        }
        
        setLoading(false);
    }, []);

    const getCurrentFirePoints = () => {
        const firePoints: { lat: number, lon: number }[] = cachedFireLocations.map((fire) => {
            const lat = parseFloat(fire.lat);
            const lon = parseFloat(fire.lon);
            return { lat, lon };
        });
        return firePoints;
    }

    const getPredictedFirePoints = () => {
        const firePoints: { lat: number, lon: number }[] = cachedFireLocationsPredicted.map((fire) => {
            const lat = parseFloat(fire.lat);
            const lon = parseFloat(fire.lon);
            return { lat, lon };
        });
        return firePoints;
    }

    const handleSend = async (text: string) => {
        const jsonFirePoints = JSON.stringify(getCurrentFirePoints());
        const viewContextSummary = viewContext.getContextSummary();
        const contentHidden = `\n\n${viewContextSummary}\n\nLegacy fire data: ${jsonFirePoints} and predicted fire locations: ${JSON.stringify(getPredictedFirePoints())}.`;
        const userId = localStorage.getItem("userId");
        if (!text.trim() || !userId) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            conversationId: "temp_" + Date.now(),
            sender: "user",
            content: text,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const loadingMessage: Message = {
            id: "loading",
            conversationId: "temp_" + Date.now(),
            sender: "bot",
            content: "💬 ...",
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, loadingMessage]);

        try {
            const response: SendMessageResponse = await sendMessage(userId, text, contentHidden);
            const botMessage = response.botMessage;

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === "loading"
                        ? {
                            id: botMessage.id,
                            conversationId: botMessage.conversationId,
                            sender: "bot",
                            content: botMessage.content,
                            createdAt: botMessage.createdAt,
                        }
                        : msg
                )
            );
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === "loading"
                        ? {
                            ...msg,
                            content: "Failed to get a response. Try again later.",
                        }
                        : msg
                )
            );
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
                    <ChatInput onSend={handleSend} />
                </CardContent>
            </Card>
        </motion.div>
    );
}
