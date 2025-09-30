import httpClient from "../api/http-client";

export type FireResponse = {
  id: string;
  location: string;
  intensity: number;
  size: number;
  containmentStatus: "contained" | "uncontained";
};

export const fetchFires = async (): Promise<FireResponse[]> => {
  const response = await httpClient.get<FireResponse[]>('/fires');
  return response.data;
};
