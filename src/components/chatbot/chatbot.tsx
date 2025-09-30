import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";

export type Message = { from: "user" | "bot"; text: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "👋 Hola, soy tu asistente. ¿Quieres información sobre los incendios?" },
  ]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }]);

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: "Procesando tu consulta 🔎..." }]);
    }, 600);
  };

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
