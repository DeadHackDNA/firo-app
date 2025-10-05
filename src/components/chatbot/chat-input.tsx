import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-white shadow-inner">
      <Input
        placeholder="Escribe un mensaje..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 rounded-full px-4 py-6 shadow-sm"
      />
      <Button
        size="icon"
        onClick={handleSend}
        className="rounded-full bg-indigo-600 hover:bg-indigo-700"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
