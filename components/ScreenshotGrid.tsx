
import React from 'react';
import type { Screenshot } from '../types';
import { formatTimestamp } from '../utils/youtube';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ScreenshotGrid: React.FC<{ screenshots: Screenshot[] }> = ({ screenshots }) => {
    if (screenshots.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Ảnh đã xử lý ({screenshots.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {screenshots.map((ss, index) => (
                    <div key={index} className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                        <div className="relative">
                           <img src={ss.dataUrl} alt={`Screenshot at ${ss.timestamp}s`} className="w-full h-auto aspect-video object-cover" />
                           <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                             <a
                                href={ss.dataUrl}
                                download={`ảnh-đã-xử-lý-${index + 1}.jpg`}
                                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors"
                            >
                                <DownloadIcon />
                                Tải xuống
                            </a>
                           </div>
                        </div>
                        <div className="p-4 min-h-[56px] flex items-center justify-center">
                            {typeof ss.timestamp === 'number' && (
                               <p className="text-center font-mono text-gray-300">Thời điểm: {formatTimestamp(ss.timestamp)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScreenshotGrid;
