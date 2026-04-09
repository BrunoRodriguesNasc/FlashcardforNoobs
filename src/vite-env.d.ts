/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  /** Alias some setups use */
  readonly VITE_OPEN_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
