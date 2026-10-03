/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_CONTENT_REVIEW_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
