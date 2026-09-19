import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const systemChrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5176",
    browserName: "chromium",
    headless: true,
    launchOptions: {
      ...(systemChrome ? { executablePath: systemChrome } : {}),
      ...(process.platform === "linux" ? { args: ["--no-sandbox"] } : {}),
    },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5176",
    url: "http://127.0.0.1:5176",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
