
import React from 'react';
import type { InputMode } from '../types';

interface InputFormProps {
    inputMode: InputMode;
    onSetInputMode: (mode: InputMode) => void;
    youtubeUrl: string;
    setYoutubeUrl: (value: string) => void;
    onFileChange: (file: File | null) => void;
    onImageChange: (file: File | null) => void;
    onPrimaryAction: () => void;
    isActionEnabled: boolean;
    disabled: boolean;
    isPausedByCaptureButton: boolean;
    error: string | null;
}

const Instructions: React.FC<{mode: InputMode}> = ({mode}) => {
    return (
        <div className="bg-gray-700/50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <h3 className="w-full text-left font-semibold text-lg text-gray-200">
                Hướng Dẫn Sử Dụng
            </h3>
            <div className="mt-4 space-y-3 text-gray-300 text-sm">
                { (mode === 'url' || mode === 'upload') && <>
                    <p><strong>Bước 1:</strong> Cung cấp video qua URL YouTube hoặc tải tệp video lên.</p>
                    <p><strong>Bước 2:</strong> Nhấn "Chụp Ảnh" để tạm dừng video. AI sẽ tự động xoá phụ đề và lưu lại khoảnh khắc.</p>
                    <p><strong>Bước 3:</strong> Nhấn "Phát Video" để tiếp tục xem.</p>
                    <p><strong>Bước 4:</strong> Các ảnh đã chụp sẽ xuất hiện trong bộ sưu tập bên dưới.</p>
                </>}
                 { mode === 'image' && <>
                    <p><strong>Bước 1:</strong> Tải lên tệp ảnh có chứa logo hoặc chi tiết bạn muốn xóa.</p>
                    <p><strong>Bước 2:</strong> Ảnh sẽ được hiển thị để xem trước.</p>
                    <p><strong>Bước 3:</strong> Nhấn "Xóa Logo" để AI xử lý ảnh.</p>
                    <p><strong>Bước 4:</strong> Ảnh đã xử lý sẽ xuất hiện trong bộ sưu tập bên dưới để bạn tải về.</p>
                </>}
            </div>
        </div>
    );
};

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MagicWandIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 16.5l3-3m0 0l3-3m-3 3l-3-3m3 3l3 3m-7.5-3.375c-1.426-1.426-1.426-3.733 0-5.159s3.733-1.426 5.159 0S18 9.875 18 11.304s-1.426 3.733-2.841 5.159-3.733 1.426-5.159 0z" />
    </svg>
);


const InputForm: React.FC<InputFormProps> = (props) => {
    
    const {
        inputMode,
        onSetInputMode,
        youtubeUrl,
        setYoutubeUrl,
        onFileChange,
        onImageChange,
        onPrimaryAction,
        isActionEnabled,
        disabled,
        isPausedByCaptureButton,
        error,
    } = props;
    
    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(event.target.files?.[0] || null);
        event.target.value = '';
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onImageChange(event.target.files?.[0] || null);
        event.target.value = '';
    };

    const getButtonContent = () => {
        if (inputMode === 'image') {
            return { icon: <MagicWandIcon />, text: 'Xóa Logo' };
        }
        if (isPausedByCaptureButton) {
            return { icon: <PlayIcon />, text: 'Phát Video' };
        }
        return { icon: <CameraIcon />, text: 'Chụp Ảnh' };
    };

    const { icon: buttonIcon, text: buttonText } = getButtonContent();

    return (
        <div className="h-full flex flex-col bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-2 -mr-2">
                <Instructions mode={inputMode} />

                <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">1. Chọn Nguồn</label>
                     <div className="flex bg-gray-700 rounded-lg p-1">
                         <button 
                            onClick={() => onSetInputMode('url')}
                            className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${inputMode === 'url' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                            disabled={disabled}
                        >
                            URL YouTube
                        </button>
                        <button 
                            onClick={() => onSetInputMode('upload')}
                            className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${inputMode === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                            disabled={disabled}
                        >
                            Tải Video
                        </button>
                         <button 
                            onClick={() => onSetInputMode('image')}
                            className={`w-1/3 p-2 rounded-md text-sm font-semibold transition ${inputMode === 'image' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                            disabled={disabled}
                        >
                            Xóa Logo Ảnh
                        </button>
                     </div>
                </div>

                {inputMode === 'url' && (
                    <div>
                        <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">URL Video YouTube</label>
                        <input
                            type="text"
                            id="youtubeUrl"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={disabled}
                        />
                    </div>
                )}
                {inputMode === 'upload' && (
                     <div>
                        <label htmlFor="videoFile" className="block text-sm font-medium text-gray-300 mb-2">Chọn tệp video từ máy tính</label>
                        <input
                            type="file"
                            id="videoFile"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            disabled={disabled}
                        />
                    </div>
                )}
                {inputMode === 'image' && (
                     <div>
                        <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300 mb-2">Chọn tệp ảnh từ máy tính</label>
                        <input
                            type="file"
                            id="imageFile"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            disabled={disabled}
                        />
                    </div>
                )}

                {error && <div className="bg-red-500/20 border-red-500 text-red-300 p-3 rounded-md">{error}</div>}
            </div>


            <div className="border-t border-gray-700 pt-6 mt-6 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">2. {inputMode === 'image' ? "Xử lý ảnh" : "Chụp hoặc Phát"}</label>
                <button
                    onClick={onPrimaryAction}
                    disabled={!isActionEnabled || disabled}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {buttonIcon}
                    {buttonText}
                </button>
            </div>

        </div>
    );
};

export default InputForm;
