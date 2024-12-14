import type { NextConfig } from "next";
import 'dotenv/config';

const nextConfig: NextConfig = {
  /* config options here */
    env: {
      GROQ_API_KEY: process.env.GROQ_API_KEY, // Expose this variable if needed on the client side
  },
};

console.log("Loaded GROQ_API_KEY from config:", process.env.GROQ_API_KEY);

export default nextConfig;
