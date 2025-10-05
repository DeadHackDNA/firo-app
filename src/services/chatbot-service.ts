import httpClient from "../api/http-client";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await httpClient.post<ChatResponse>("/chat", payload);
  return data;
}


export const getChatbotMessages = async () => {
  const { data } = await httpClient.get("/chat");
  return data;
};