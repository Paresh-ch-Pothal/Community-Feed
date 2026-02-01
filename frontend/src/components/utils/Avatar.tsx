import React from 'react';
import { getAvatarColor } from '../../utils/helpers';


interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ username, size = 'md', showOnline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const onlineDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const gradientColor = getAvatarColor(username);

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${gradientColor} flex items-center justify-center text-white font-bold shadow-md`}
      >
        {username.charAt(0).toUpperCase()}
      </div>
      {showOnline && (
        <div className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} bg-green-400 border-2 border-white rounded-full`}></div>
      )}
    </div>
  );
};

export default Avatar;