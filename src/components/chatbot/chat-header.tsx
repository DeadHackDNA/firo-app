import { Bot } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 text-lg font-semibold shadow">
      <Bot className="w-5 h-5" /> Fyro Chat
    </div>
  );
}
