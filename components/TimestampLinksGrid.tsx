import React from 'react';
import type { TranscriptLine } from '../types';
import { formatTimestamp } from '../utils/youtube';

const NewTabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);


interface TimestampLinksGridProps {
    links: TranscriptLine[];
    videoId: string;
}

const TimestampLinksGrid: React.FC<TimestampLinksGridProps> = ({ links, videoId }) => {
    if (links.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">
                Liên kết tới các thời điểm ({links.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {links.map((link, index) => (
                    <a 
                        key={index}
                        href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(link.timestamp)}s`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-gray-800 rounded-lg p-4 shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-gray-700"
                    >
                        <div className="flex justify-between items-center mb-2">
                             <p className="font-mono text-lg text-blue-400">{formatTimestamp(link.timestamp)}</p>
                             <NewTabIcon />
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-3">
                            "{link.text}"
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default TimestampLinksGrid;