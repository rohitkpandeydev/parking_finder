// Production API is served behind nginx + HTTPS.
// Keep this as domain root; API client appends /api/* paths.
export const API_BASE_URL = 'https://smartparkingbits.duckdns.org';

export const getApiBaseUrl = (): string => API_BASE_URL;
