import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: true, // Dòng này cực kỳ quan trọng: Nó bắt Vite phải chạy đúng 5176, nếu bận nó sẽ báo lỗi chứ không tự nhảy sang cổng khác
  },
});
