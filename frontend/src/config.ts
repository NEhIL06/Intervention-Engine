// Configuration for backend connection
// These can be overridden via environment variables during build
// For Netlify: Set EXPO_PUBLIC_BACKEND_HTTP_URL and EXPO_PUBLIC_BACKEND_WS_URL in site settings
// For local dev: Create .env file with these variables

const DEFAULT_HTTP_URL = "https://intervention-engine.onrender.com";
const DEFAULT_WS_URL = "wss://intervention-engine.onrender.com";

export const BACKEND_HTTP_URL =
    process.env.EXPO_PUBLIC_BACKEND_HTTP_URL || DEFAULT_HTTP_URL;

export const BACKEND_WS_URL =
    process.env.EXPO_PUBLIC_BACKEND_WS_URL || DEFAULT_WS_URL;

// Student ID for this app instance
export const STUDENT_ID = "11111111-1111-1111-1111-111111111111";
