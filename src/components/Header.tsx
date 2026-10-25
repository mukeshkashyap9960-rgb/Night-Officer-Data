import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Languages, 
  Menu, 
  Printer, 
  Volume2, 
  VolumeX,
  Calendar,
  Share2
} from 'lucide-react';

interface HeaderProps {
  currentDate: Date;
  isNightShiftActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestAlert: () => void;
  onOpenAlertSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenRollCall: () => void;
  onPrint: () => void;
  lang: 'gu' | 'en';
  onToggleLang: () => void;
  onOpenBroadcastToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  isNightShiftActive,
  soundEnabled,
  onToggleSound,
  onTestAlert,
  onOpenAlertSettings,
  onOpenAnalytics,
  onOpenRollCall,
  onPrint,
  lang,
  onToggleLang,
  onOpenBroadcastToday,
}) => {
  const formattedTime = currentDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDateGu = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  return (
    <header className="h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:hidden">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Menu className="text-white" size={24} />
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
           <Calendar className="text-blue-500" size={14} />
           <span className="text-xs font-bold text-slate-300 font-mono">{formattedDateGu}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
           <span className={`w-2 h-2 rounded-full ${isNightShiftActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
           <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
             {isNightShiftActive ? 'Night Shift Active' : 'Day Shift'}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end mr-4">
          <span className="text-xl font-bold text-white font-mono leading-none">{formattedTime}</span>
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Indian Standard Time</span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all cursor-pointer"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={onOpenAlertSettings}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-all cursor-pointer"
        >
          <Settings size={18} />
        </button>

        <button
          onClick={onOpenBroadcastToday}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
        >
          <Share2 size={16} />
          Broadcast
        </button>
      </div>
    </header>
  );
};
