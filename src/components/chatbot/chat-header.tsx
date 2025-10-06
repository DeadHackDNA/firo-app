import { Bot, Flame } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white p-4 shadow-lg border-b border-red-500/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bot className="w-6 h-6" />
          <Flame className="w-3 h-3 absolute -top-1 -right-1 text-orange-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Fire Assistant</h1>
          <p className="text-xs text-red-100 opacity-90">AI-powered wildfire analysis</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">Online</span>
      </div>
    </div>
  );
}
