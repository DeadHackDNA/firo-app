import { motion } from "framer-motion";
import type { Message } from "./chatbot";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-w-[80%] px-4 py-4 rounded-2xl text-sm shadow-md ${
            msg.from === "user"
              ? "ml-auto bg-indigo-600 text-white"
              : "mr-auto bg-white border border-gray-200"
          }`}
        >
          {msg.text}
        </motion.div>
      ))}
    </div>
  );
}
