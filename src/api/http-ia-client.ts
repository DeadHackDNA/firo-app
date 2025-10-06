import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_FIRO_IA_API ?? "";

if (!BASE_URL) {
  throw new Error("VITE_FIRO_IA_API is not defined in environment variables");
}

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export default httpClient;
