export type SpotifyEmbedController = {
  play: () => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  addListener: (event: string, callback: (payload: { data: unknown }) => void) => void
}

export type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: {
      uri?: string
      url?: string
      width?: string
      height?: string
    },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void
    Spotify?: {
      IframeApi?: SpotifyIframeApi
    }
  }
}
