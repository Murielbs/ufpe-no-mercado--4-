import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // URLs relativas permitem publicar o app em um subdiretório, como o GitHub Pages.
  base: "./",
  plugins: [react()],
});
