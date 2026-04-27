/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the FinTrack backend API, including the `/api` global prefix.
   * Defined in `.env` / `.env.example`.
   * Example: `http://localhost:3000/api`.
   */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
