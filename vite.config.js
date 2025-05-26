import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add your ngrok host to the allowed hosts list
    allowedHosts: [
      "29e9-2409-4080-9d86-128b-24ea-16d4-c40e-b499.ngrok-free.app",
      // You can use a wildcard to allow all ngrok subdomains
      // '*.ngrok-free.app',
    ],
  },
});
