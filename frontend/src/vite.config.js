import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The SPA talks only to the API gateway. In dev, proxy /v1/* to the gateway
// so the browser never hits CORS and the app matches production routing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/v1": {
        target: process.env.VITE_GATEWAY_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
