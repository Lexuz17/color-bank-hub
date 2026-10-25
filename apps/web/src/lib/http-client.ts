import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) throw new Error("VITE_API_BASE_URL must be configured in .env");

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
});

// Todo: Impl fetch wrapper, handle api error, request-id
