// Playwright (dev-only): opens the homepage in Chrome and checks the key behaviours.
import { defineConfig } from '@playwright/test';

const PORT = 8417; // not 4173: Vite preview (VC Map) often uses that one

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    channel: 'chrome', // the Chrome already installed on this computer, no extra download
  },
  webServer: {
    command: `node tests/serve.js ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
  },
});
