// Fix: Add YouTube Iframe API type definitions to fix YT namespace errors.
declare global {
  namespace YT {
    const enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface Player {
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      pauseVideo(): void;
      cueVideoById(videoId: string): void;
      destroy(): void;
      mute(): void;
      getPlayerState(): PlayerState;
      getCurrentTime(): number;
      playVideo(): void;
    }

    interface PlayerEvent {
      target: Player;
      data: any;
    }

    interface OnStateChangeEvent extends PlayerEvent {
      data: PlayerState;
    }
  }

  interface Window {
    YT?: {
      Player: new (elementId: string | HTMLElement, options: any) => YT.Player;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type InputMode = 'url' | 'upload' | 'image';

export interface Screenshot {
  timestamp?: number;
  dataUrl: string;
}
