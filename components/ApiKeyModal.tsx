
import React, { useState } from 'react';

interface ApiKeyModalProps {
    onKeySubmit: (key: string) => void;
    error?: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit, error }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex items-center justify-center p-4">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
                <h1 className="text-3xl font-bold mb-4">Nhập Khóa API Gemini</h1>
                <p className="text-gray-300 mb-6">
                    Để sử dụng ứng dụng, bạn cần cung cấp khóa API Gemini của riêng mình. Khóa của bạn sẽ được lưu trữ an toàn trong trình duyệt của bạn.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Dán khóa API của bạn vào đây"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        aria-label="Gemini API Key"
                    />
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Lưu và Tiếp Tục
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-4">
                    Bạn có thể nhận khóa API của mình từ 
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 ml-1">
                        Google AI Studio.
                    </a>
                </p>
                {error && <div className="mt-4 bg-red-500/20 border-red-500 text-red-300 p-3 rounded-md">{error}</div>}
            </div>
        </div>
    );
};

export default ApiKeyModal;
