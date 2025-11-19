
import React, { useEffect, useRef } from 'react';
import type { InputMode } from '../types';

interface PlayerProps {
    mode: InputMode;
    videoId: string | null;
    videoSrc: string | null;
    onReady: (event: YT.PlayerEvent) => void;
    onError: (event: YT.PlayerEvent) => void;
    localRef: React.RefObject<HTMLVideoElement>;
    onLocalPlayerError: () => void;
    onStateChange?: (event: YT.OnStateChangeEvent) => void;
    onLocalPlay?: () => void;
}

const YouTubePlayer: React.FC<Pick<PlayerProps, 'videoId' | 'onReady' | 'onError' | 'onStateChange'>> = ({ videoId, onReady, onError, onStateChange }) => {
    const playerDivRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);

     useEffect(() => {
        const createPlayer = () => {
            if (playerDivRef.current && window.YT && videoId) {
                playerRef.current = new window.YT.Player(playerDivRef.current, {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        playsinline: 1,
                        controls: 1, // Show controls for manual operation
                        rel: 0,
                        modestbranding: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: onReady,
                        onError: onError,
                        onStateChange: onStateChange,
                    },
                });
            }
        };

        if (!window.YT || !window.YT.Player) {
            // If API is not loaded, load it
             if (!(window as any).onYouTubeIframeAPIReady) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                if (firstScriptTag && firstScriptTag.parentNode) {
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                }
                (window as any).onYouTubeIframeAPIReady = () => {
                    createPlayer();
                };
            }
        } else {
            // API is ready
            if (playerRef.current) {
                 if (videoId) {
                     // If player exists, just load new video
                     playerRef.current.cueVideoById(videoId);
                 }
            } else {
                createPlayer();
            }
        }

        return () => {
             playerRef.current?.destroy();
             playerRef.current = null;
        };

    }, [videoId, onReady, onError, onStateChange]);

    return <div ref={playerDivRef} className="w-full h-full" />;
};


const LocalPlayer: React.FC<Pick<PlayerProps, 'videoSrc' | 'localRef' | 'onLocalPlayerError' | 'onLocalPlay'>> = ({ videoSrc, localRef, onLocalPlayerError, onLocalPlay }) => {
    if (!videoSrc) return null;

    return (
        <video
            ref={localRef}
            src={videoSrc}
            onError={onLocalPlayerError}
            onPlay={onLocalPlay}
            className="w-full h-full"
            playsInline
            controls 
        />
    )
};


const Player: React.FC<PlayerProps> = (props) => {
    if (props.mode === 'url' && props.videoId) {
        return <YouTubePlayer videoId={props.videoId} onReady={props.onReady} onError={props.onError} onStateChange={props.onStateChange} />;
    }
    if (props.mode === 'upload' && props.videoSrc) {
        return <LocalPlayer videoSrc={props.videoSrc} localRef={props.localRef} onLocalPlayerError={props.onLocalPlayerError} onLocalPlay={props.onLocalPlay} />
    }
    return null;
};

export default Player;