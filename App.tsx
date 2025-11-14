
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Screenshot, InputMode } from './types';
import { getVideoId } from './utils/youtube';
import Header from './components/Header';
import InputForm from './components/InputForm';
import Player from './components/Player';
import ScreenshotGrid from './components/ScreenshotGrid';
import Loader from './components/Loader';
import ApiKeyModal from './components/ApiKeyModal';
import { removeSubtitlesFromImage, removeLogoFromImage } from './utils/gemini';

declare const html2canvas: any;

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputMode, setInputMode] = useState<InputMode>('url');
    const [youtubeUrl, setYoutubeUrl] = useState<string>('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPausedByCaptureButton, setIsPausedByCaptureButton] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    const ytPlayerRef = useRef<YT.Player | null>(null);
    const localPlayerRef = useRef<HTMLVideoElement | null>(null);
    
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (videoSrc) URL.revokeObjectURL(videoSrc);
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
    }, [videoSrc, imageSrc]);

    useEffect(() => {
        setIsPausedByCaptureButton(false);
    }, [videoId, videoSrc]);

    const handleKeySubmit = (key: string) => {
        localStorage.setItem('gemini-api-key', key);
        setApiKey(key);
        setApiKeyError(null);
    };

    const handleSetInputMode = (mode: InputMode) => {
        setInputMode(mode);
        setError(null);
        setScreenshots([]);

        // Clear URL state
        setYoutubeUrl('');
        setVideoId(null);
        
        // Clear video file state
        if (videoSrc) URL.revokeObjectURL(videoSrc);
        setVideoFile(null);
        setVideoSrc(null);
        
        // Clear image file state
        if (imageSrc) URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
    }

    const handleFileChange = (file: File | null) => {
        if (videoSrc) URL.revokeObjectURL(videoSrc);
        setVideoFile(file);
        if (file) {
            setVideoId(null); 
            setYoutubeUrl('');
            if (imageSrc) URL.revokeObjectURL(imageSrc);
            setImageSrc(null);
            const newSrc = URL.createObjectURL(file);
            setVideoSrc(newSrc);
        } else {
            setVideoSrc(null);
        }
    };
    
    const handleImageChange = (file: File | null) => {
        if (imageSrc) URL.revokeObjectURL(imageSrc);
        if (file) {
            setVideoId(null); 
            setYoutubeUrl('');
            if (videoSrc) URL.revokeObjectURL(videoSrc);
            setVideoFile(null);
            setVideoSrc(null);
            const newSrc = URL.createObjectURL(file);
            setImageSrc(newSrc);
        } else {
            setImageSrc(null);
        }
    };

    const handleUrlChange = (url: string) => {
        setYoutubeUrl(url);
        const id = getVideoId(url);
        setVideoId(id);
        if (id) {
            if (videoSrc) URL.revokeObjectURL(videoSrc);
            setVideoFile(null);
            setVideoSrc(null);
            if (imageSrc) URL.revokeObjectURL(imageSrc);
            setImageSrc(null);
        }
    };

    const handlePrimaryAction = async () => {
        setError(null);
        setApiKeyError(null);
        
        if (!apiKey) {
            setError("Vui lòng cung cấp khóa API để tiếp tục.");
            return;
        }


        if (inputMode === 'image') {
            if (!imageSrc) {
                setError("Vui lòng tải lên một ảnh để xử lý.");
                return;
            }
            setIsProcessing(true);
            try {
                const imageWithoutLogo = await removeLogoFromImage(imageSrc, apiKey);
                const newScreenshot: Screenshot = { dataUrl: imageWithoutLogo };
                setScreenshots(prev => [newScreenshot, ...prev]);
            } catch (err) {
                 if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("permission to access"))) {
                    setApiKeyError("Khóa API của bạn không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại.");
                    localStorage.removeItem('gemini-api-key');
                    setApiKey(null);
                 } else {
                    console.error("Lỗi khi xóa logo:", err);
                    setError("Có lỗi xảy ra khi xóa logo.");
                 }
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        if (isPausedByCaptureButton) {
            // Play action
            if (inputMode === 'url' && ytPlayerRef.current) {
                ytPlayerRef.current.playVideo();
            } else if (inputMode === 'upload' && localPlayerRef.current) {
                await localPlayerRef.current.play();
            }
            setIsPausedByCaptureButton(false);
            return;
        }
        
        // Capture action
        const playerWrapper = document.getElementById('player-wrapper');

        if (!playerWrapper) {
            setError("Không tìm thấy trình phát video.");
            return;
        }

        if (!(ytPlayerRef.current || localPlayerRef.current)) {
            setError("Trình phát video chưa sẵn sàng.");
            return;
        }
        
        setIsCapturing(true);

        try {
            if (inputMode === 'url' && ytPlayerRef.current) {
                ytPlayerRef.current.pauseVideo();
            } else if (inputMode === 'upload' && localPlayerRef.current) {
                localPlayerRef.current.pause();
            }
            await new Promise(resolve => setTimeout(resolve, 150));

            const canvas = await html2canvas(playerWrapper, { useCORS: true, allowTaint: true });
            const currentFrameDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            setIsCapturing(false);
            setIsProcessing(true);

            const imageWithoutSubs = await removeSubtitlesFromImage(currentFrameDataUrl, apiKey);

            let currentTime = 0;
            if (inputMode === 'url' && ytPlayerRef.current) {
                currentTime = ytPlayerRef.current.getCurrentTime();
            } else if (inputMode === 'upload' && localPlayerRef.current) {
                currentTime = localPlayerRef.current.currentTime;
            }

            const newScreenshot: Screenshot = {
                timestamp: currentTime,
                dataUrl: imageWithoutSubs
            };

            setScreenshots(prev => {
                const newScreenshots = [...prev, newScreenshot];
                return newScreenshots.sort((a,b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
            });
            
            setIsPausedByCaptureButton(true);

        } catch (err) {
            if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("permission to access"))) {
                setApiKeyError("Khóa API của bạn không hợp lệ hoặc đã hết hạn. Vui lòng nhập lại.");
                localStorage.removeItem('gemini-api-key');
                setApiKey(null);
            } else {
                console.error("Lỗi khi chụp hoặc xử lý ảnh:", err);
                setError("Có lỗi xảy ra khi chụp hoặc xử lý ảnh.");
            }
        } finally {
            setIsCapturing(false);
            setIsProcessing(false);
        }
    };

    const onPlayerReady = useCallback((event: YT.PlayerEvent) => {
        ytPlayerRef.current = event.target;
    }, []);

    const onPlayerStateChange = useCallback((event: YT.OnStateChangeEvent) => {
        if (event.data === YT.PlayerState.PLAYING) {
            setIsPausedByCaptureButton(false);
        }
    }, []);

    const onLocalPlay = useCallback(() => {
        setIsPausedByCaptureButton(false);
    }, []);

    const onPlayerError = useCallback((event: YT.PlayerEvent) => {
        const errorCode = event.data;
        let errorMessage = `Đã xảy ra lỗi với trình phát YouTube (Mã lỗi: ${errorCode}).`;
        if (errorCode === 101 || errorCode === 150 || errorCode === 153) {
            errorMessage = "Chủ sở hữu video này không cho phép phát trên các trang web khác. Vui lòng thử một video khác hoặc tải video về máy và sử dụng chế độ 'Tải lên Video'."
        }
        setError(errorMessage);
    }, []);

    const onLocalPlayerError = useCallback(() => {
        setError("Không thể phát tệp video. Tệp có thể bị hỏng hoặc không được trình duyệt hỗ trợ.");
    }, []);
    
    const getLoaderMessage = () => {
        if (isCapturing) return "Đang chụp ảnh...";
        if (isProcessing) {
            if (inputMode === 'image') return "AI đang xóa logo...";
            return "AI đang xoá phụ đề...";
        }
        return "";
    }

    if (!apiKey) {
        return <ApiKeyModal onKeySubmit={handleKeySubmit} error={apiKeyError} />;
    }


    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            {(isCapturing || isProcessing) && <Loader message={getLoaderMessage()} />}
            <Header 
              isSidebarOpen={isSidebarOpen} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <main className="container mx-auto p-4 md:p-8">
                <div className={`grid grid-cols-1 lg:grid-cols-1fr transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:grid-cols-[28rem_1fr] lg:gap-x-8' : 'lg:grid-cols-[0rem_1fr] lg:gap-x-0'}`}>
                    
                    {/* Sidebar */}
                    <aside className="overflow-hidden h-full mb-4 lg:mb-0">
                        <div className="w-[28rem] h-full flex flex-col">
                          <InputForm
                              inputMode={inputMode}
                              onSetInputMode={handleSetInputMode}
                              youtubeUrl={youtubeUrl}
                              setYoutubeUrl={handleUrlChange}
                              onFileChange={handleFileChange}
                              onImageChange={handleImageChange}
                              onPrimaryAction={handlePrimaryAction}
                              isActionEnabled={!!(videoId || videoSrc || imageSrc)}
                              disabled={isCapturing || isProcessing}
                              isPausedByCaptureButton={isPausedByCaptureButton}
                              error={error}
                          />
                        </div>
                    </aside>
                    
                    {/* Player/Image Container */}
                    <div className="min-w-0">
                        <div id="player-wrapper" className="bg-black rounded-lg shadow-2xl aspect-video w-full">
                            { (inputMode === 'url' && videoId) || (inputMode === 'upload' && videoSrc) ? (
                                <Player
                                    mode={inputMode}
                                    videoId={videoId}
                                    videoSrc={videoSrc}
                                    onReady={onPlayerReady}
                                    onError={onPlayerError}
                                    localRef={localPlayerRef}
                                    onLocalPlayerError={onLocalPlayerError}
                                    onStateChange={onPlayerStateChange}
                                    onLocalPlay={onLocalPlay}
                                />
                            ) : inputMode === 'image' && imageSrc ? (
                                <img src={imageSrc} alt="Xem trước" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <div className="aspect-video w-full bg-gray-800 flex items-center justify-center rounded-lg">
                                    <p className="text-gray-500">
                                        { inputMode === 'image' 
                                            ? "Khu vực xem trước ảnh sẽ xuất hiện ở đây"
                                            : "Trình phát video sẽ xuất hiện ở đây"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ScreenshotGrid screenshots={screenshots} />
            </main>
        </div>
    );
};

export default App;
