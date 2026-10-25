import React, { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Shield, Search, User, Check, ListFilter } from 'lucide-react';
import { Officer } from '../types/roster';

interface DutySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  dutyColumnId: string;
  currentSquad: string;
  onApplySwap: (date: string, dutyColumnId: string, newSquad: string) => void;
  officers: Officer[];
  lang: 'gu' | 'en';
}

export const DutySwapModal: React.FC<DutySwapModalProps> = ({
  isOpen,
  onClose,
  date,
  dutyColumnId,
  currentSquad,
  onApplySwap,
  officers,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PI' | 'PSI'>('ALL');

  if (!isOpen) return null;

  const isPIColumn = dutyColumnId === 'communalPi' || dutyColumnId === 'divisionPi';
  
  // Set default filter based on column type if needed, or allow all
  const filteredOfficers = useMemo(() => {
    return officers.filter((off) => {
      const matchesSearch = !searchTerm.trim() || 
        off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        off.squad.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeFilter === 'ALL' || off.category === activeFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [officers, searchTerm, activeFilter]);

  const dutyTitleMap: Record<string, { gu: string; en: string }> = {
    communalPi: { gu: 'કોમ્યુનલ નાઈટ (PI)', en: 'Communal Night (PI)' },
    divisionPi: { gu: 'ડીવીઝન નાઈટ (PI)', en: 'Division Night (PI)' },
    cmMorchoPsi: { gu: 'CM મોરચો (PSI)', en: 'CM Morcho (PSI)' },
    campusPsi: { gu: 'કેમ્પસ નાઈટ (PSI)', en: 'Campus Night (PSI)' },
    vvipPsi: { gu: 'VVIP બંદોબસ્ત (PSI)', en: 'VVIP Bandobast (PSI)' },
  };

  const dutyTitle = dutyTitleMap[dutyColumnId] || { gu: dutyColumnId, en: dutyColumnId };

  const handleSelectOfficer = (squad: string) => {
    onApplySwap(date, dutyColumnId, squad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/30">
              <ArrowRightLeft className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white leading-tight">
                {lang === 'gu' ? 'અધિકારી પસંદ કરો' : 'Select Officer'}
              </h3>
              <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">
                {date} • {lang === 'gu' ? dutyTitle.gu : dutyTitle.en}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        {/* Filter Section */}
        <div className="p-8 border-b border-slate-800 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={lang === 'gu' ? 'નામ અથવા સ્કોડ દ્વારા શોધો...' : 'Search by name or squad...'}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-white text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex bg-slate-950 border-2 border-slate-800 rounded-xl p-1 shrink-0">
            {(['ALL', 'PI', 'PSI'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeFilter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/30">
          {filteredOfficers.length === 0 ? (
            <div className="py-20 text-center text-slate-600 font-bold text-lg">
              {lang === 'gu' ? 'કોઈ અધિકારી મળ્યા નથી' : 'No officers found'}
            </div>
          ) : (
            filteredOfficers.map((off) => (
              <button
                key={off.id}
                onClick={() => handleSelectOfficer(off.squad)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                  off.squad === currentSquad 
                    ? 'bg-blue-600 border-blue-500 shadow-xl' 
                    : 'bg-slate-900 border-slate-800 hover:border-blue-500/30 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    off.squad === currentSquad 
                      ? 'bg-white/20 text-white' 
                      : (off.category === 'PI' ? 'bg-blue-600/20 text-blue-500' : 'bg-emerald-600/20 text-emerald-500')
                  }`}>
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-black px-3 py-0.5 rounded-full uppercase border ${
                        off.squad === currentSquad 
                          ? 'bg-white/20 text-white border-white/30' 
                          : (off.category === 'PI' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800')
                      }`}>
                        {off.category}
                      </span>
                      <span className={`text-xs font-mono font-black uppercase tracking-widest ${off.squad === currentSquad ? 'text-white/60' : 'text-slate-500'}`}>
                        {off.squad}
                      </span>
                    </div>
                    <h4 className={`text-2xl font-black tracking-tight ${off.squad === currentSquad ? 'text-white' : 'text-white group-hover:text-blue-400'}`}>
                      {off.name}
                    </h4>
                    <p className={`text-sm font-bold ${off.squad === currentSquad ? 'text-white/70' : 'text-slate-500'}`}>
                      {off.rank}
                    </p>
                  </div>
                </div>

                {off.squad === currentSquad && (
                  <div className="bg-white text-blue-600 p-2 rounded-full shadow-lg">
                    <Check size={24} />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-slate-400 hover:text-white font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
