# Contributing

Install the development dependencies and Chromium before running verification:

```bash
npm ci
npx playwright install chromium
npm run verify
```

Verification checks stylesheet linting, builds the CSS once, runs smoke and browser layout tests, and validates the package. Tests read the built stylesheet rather than rebuilding it.

To use an existing Chromium-based browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path. CI installs the Playwright Chromium build and its system dependencies before verification.

The browser tests cover heading and paragraph spacing, inherited custom properties, container boundaries, and CSS overrides. Run them after building:

```bash
npm run build
npm run test:layout
```
