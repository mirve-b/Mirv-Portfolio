/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_ACCESS_KEY: string
  readonly VITE_SPOTIFY_EMBED_URL?: string
  readonly VITE_SPOTIFY_WEB_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.glsl?raw' {
  const source: string
  export default source
}
