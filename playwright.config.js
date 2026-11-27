// Playwright (dev-only): opens the homepage in Chrome and checks the key behaviours.
import { defineConfig } from '@playwright/test';

// Not 4173: Vite preview (VC Map) often uses that one. 8418, so tests can run
// while `node tests/serve.js` (8417) is open for manual checks.
const PORT = 8418;

export default defineConfig({
  testDir: 'tests',
  expect: { timeout: 10_000 }, // the full Reveal intro takes about 5 s
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
