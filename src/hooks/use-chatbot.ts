import { useMutation, useQuery } from "@tanstack/react-query";
import { sendMessage, type ChatResponse, type ChatRequest, getChatbotMessages } from "../services/chatbot-service";

export function useChatbot(onSuccess?: (data: ChatResponse) => void, onError?: (err: unknown) => void) {
  return useMutation<ChatResponse, unknown, ChatRequest>({
    mutationFn: sendMessage,
    onSuccess,
    onError,
  });
}


export function useChatbotMessages() {
  return useQuery({
    queryKey: ["chatbotMessages"],
    queryFn: getChatbotMessages,
    staleTime: 1000 * 60,
  });
}
