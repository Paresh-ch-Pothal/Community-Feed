// import React from 'react';
// import { TrendingUp, Trophy, Award, Medal } from 'lucide-react';

// import Avatar from './Avatar';
// import type { LeaderboardEntry } from '../../types';

// interface LeaderboardProps {
//   entries: LeaderboardEntry[];
// }

// const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
//   const getMedalIcon = (index: number) => {
//     switch (index) {
//       case 0:
//         return <Trophy className="w-5 h-5 text-yellow-500" />;
//       case 1:
//         return <Award className="w-5 h-5 text-slate-400" />;
//       case 2:
//         return <Medal className="w-5 h-5 text-amber-600" />;
//       default:
//         return null;
//     }
//   };

//   const getRankBadgeColor = (index: number) => {
//     switch (index) {
//       case 0:
//         return 'bg-yellow-500';
//       case 1:
//         return 'bg-slate-400';
//       case 2:
//         return 'bg-amber-600';
//       default:
//         return 'bg-blue-600';
//     }
//   };

//   return (
//     <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-20">
//       <div className="p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
//             <TrendingUp className="w-5 h-5 text-white" />
//           </div>
//           <h2 className="text-xl font-bold text-slate-900">Top Creators</h2>
//         </div>

//         <div className="space-y-3">
//           {entries.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
//                 <TrendingUp className="w-8 h-8 text-slate-400" />
//               </div>
//               <p className="text-sm text-slate-500">No activity yet</p>
//               <p className="text-xs text-slate-400 mt-1">Be the first to earn karma!</p>
//             </div>
//           ) : (
//             entries.map((entry, index) => (
//               <div
//                 key={entry.username}
//                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
//               >
//                 <div className="shrink-0 relative">
//                   <div
//                     className={`w-10 h-10 rounded-full ${getRankBadgeColor(
//                       index
//                     )} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
//                   >
//                     {index + 1}
//                   </div>
//                   {index < 3 && (
//                     <div className="absolute -top-1 -right-1">
//                       {getMedalIcon(index)}
//                     </div>
//                   )}
//                 </div>

//                 <Avatar username={entry.username} size="md" />

//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold text-slate-900 text-sm truncate">
//                     {entry.username}
//                   </p>
//                   <p className="text-xs text-slate-500">{entry.karma} karma points</p>
//                 </div>

//                 <div className="shrink-0">
//                   <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
//                     24h
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {entries.length > 0 && (
//         <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
//           <p className="text-xs text-slate-600 text-center">
//             Rankings update every 24 hours
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Leaderboard;


import React, { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Award, Medal, RefreshCw } from 'lucide-react';

import Avatar from './Avatar';
import type { LeaderboardEntry } from '../../types';
import { leaderboardService } from '../../services/api';
import CONFIG from '../../config/config';


interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onUpdate?: (entries: LeaderboardEntry[]) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries: initialEntries, onUpdate }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  useEffect(() => {
    // Auto-refresh leaderboard at configured interval
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, CONFIG.LEADERBOARD_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const refreshLeaderboard = async () => {
    try {
      setIsRefreshing(true);
      const response = await leaderboardService.getLeaderboard();
      setEntries(response);
      setLastUpdated(new Date());
      
      if (onUpdate) {
        onUpdate(response);
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    if (!isRefreshing) {
      refreshLeaderboard();
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Award className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500';
      case 1:
        return 'bg-slate-400';
      case 2:
        return 'bg-amber-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return `${diffInMinutes}m ago`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Top Creators</h2>
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Refresh leaderboard"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw 
              className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No activity yet</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to earn karma!</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.username}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="shrink-0 relative">
                  <div
                    className={`w-10 h-10 rounded-full ${getRankBadgeColor(
                      index
                    )} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1">
                      {getMedalIcon(index)}
                    </div>
                  )}
                </div>

                <Avatar username={entry.username} size="md" />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {entry.username}
                  </p>
                  <p className="text-xs text-slate-500">{entry.karma} karma points</p>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    24h
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs">
            <p className="text-slate-600">
              Rankings update every 24 hours
            </p>
            <p className="text-slate-500">
              Updated {getTimeAgo()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;