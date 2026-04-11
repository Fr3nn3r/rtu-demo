# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Pre-demo verification

Before demoing to a customer, run the full verification gate:

```bash
npm run verify
```

This runs TypeScript type check (`tsc -b`), ESLint (`eslint .`), and Playwright smoke tests (`playwright test`) against a Playwright-managed dev server. If any step fails, **do not demo** — investigate and fix before proceeding.

### Smoke test scope

The smoke suite (`tests/smoke.spec.ts`) covers:

- **Route smoke** — Every top-level route renders without console errors: `/`, `/claims`, `/claims/:id`, `/inbox`, `/dashboard`, `/contacts`.
- **Sidebar navigation** — Clicking through every sidebar link in sequence without a full reload.
- **Happy paths** — One full workflow walk per claim type:
  - Accident: `CLM-10001` (NEW → ... → CLOSED via Internal Approval branch)
  - Theft: `CLM-10008` (INVESTIGATOR_APPOINTED → ... → CLOSED)
  - Glass: `CLM-10009` (NEW → ... → CLOSED)

### Debugging failures

- `npm run smoke:headed` — watch the tests run in a real Chrome window.
- `npm run smoke:ui` — Playwright's time-travel debugger.
- Screenshots, videos, and traces for failed tests are saved under `test-results/`.

Any render error in the app is caught by the route-level Error Boundary (`src/components/layout/error-boundary.tsx`) and surfaced as a visible fallback card with the error message and stack — no more blank screens.
