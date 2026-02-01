import React from 'react';
import { LogOut, Plus } from 'lucide-react';
import Avatar from './Avatar';

interface HeaderProps {
  username: string;
  onLogout: () => void;
  onCreatePost: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout, onCreatePost }) => {
  return (
    <header className="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent">
              Community Feed
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Create Post Button - Desktop */}
            <button
              onClick={onCreatePost}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Avatar username={username} size="sm" showOnline={true} />
              <span className="font-semibold text-gray-900 hidden sm:block">{username}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;