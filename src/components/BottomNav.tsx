import React from 'react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRoute,
  onNavigate,
  unreadCount = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-4xl mx-auto bg-[#fdf8f8] border-t border-[#ebe1d4] flex justify-around items-center px-4 py-2">
      <button
        onClick={() => onNavigate('/inbox')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-all ${
          currentRoute === '/inbox' ? 'text-[#000000] font-bold' : 'text-[#5e5e5b] hover:text-[#000000]'
        }`}
      >
        <div className="relative">
          <span className={`material-symbols-outlined text-2xl ${currentRoute === '/inbox' ? 'filled' : ''}`}>
            mail
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="font-mono-caps text-[10px] mt-0.5 tracking-wider uppercase">Messages</span>
      </button>

      <button
        onClick={() => onNavigate('/prompts')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-all ${
          currentRoute === '/prompts' ? 'text-[#000000] font-bold' : 'text-[#5e5e5b] hover:text-[#000000]'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${currentRoute === '/prompts' ? 'filled' : ''}`}>
          auto_awesome
        </span>
        <span className="font-mono-caps text-[10px] mt-0.5 tracking-wider uppercase">Prompts</span>
      </button>

      <button
        onClick={() => onNavigate('/settings')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-all ${
          currentRoute === '/settings' ? 'text-[#000000] font-bold' : 'text-[#5e5e5b] hover:text-[#000000]'
        }`}
      >
        <span className={`material-symbols-outlined text-2xl ${currentRoute === '/settings' ? 'filled' : ''}`}>
          person
        </span>
        <span className="font-mono-caps text-[10px] mt-0.5 tracking-wider uppercase">Profil</span>
      </button>
    </nav>
  );
};
