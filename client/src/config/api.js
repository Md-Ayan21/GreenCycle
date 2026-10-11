const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = "/api";

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");
