import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      statements: 80,
      branches: 100,
      functions: 80,
      lines: 80,
      include: ["src/lib/**/*.ts"],
      exclude: ["**/*.test.tsx", "supabase/**"],
    },
  },
});