import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api",
});

// Todo: Impl fetch wrapper, handle api error, request-id
