
import React from 'react';

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm10 3a1 1 0 10-2 0v1a1 1 0 102 0V8zM4 15a1 1 0 01-1-1V7a1 1 0 011-1h1v2.5a.5.5 0 001 0V6h8v2.5a.5.5 0 001 0V6h1a1 1 0 011 1v7a1 1 0 01-1 1H4z" clipRule="evenodd" />
      <path d="M10 14a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

const SidebarCollapseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const SidebarExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

interface HeaderProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}


const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <CameraIcon />
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
                        Công Cụ Chụp Ảnh Video
                    </h1>
                </div>
                 <button 
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    title={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
                >
                    {isSidebarOpen ? <SidebarCollapseIcon /> : <SidebarExpandIcon />}
                </button>
            </div>
        </header>
    );
};

export default Header;
