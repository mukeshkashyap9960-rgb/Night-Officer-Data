import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowRightLeft, Shield, Search, User, Check, Phone, Plus, Sparkles } from 'lucide-react';
import { Officer } from '../types/roster';
import { formatSquadText } from '../utils/whatsapp';

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
  const [customSquad, setCustomSquad] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isPIColumn = dutyColumnId === 'communalPi' || dutyColumnId === 'divisionPi';

  // Automatically pre-select the appropriate filter when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveFilter(isPIColumn ? 'PI' : 'PSI');
      setSearchTerm('');
      setCustomSquad('');
      setShowCustomInput(false);
    }
  }, [isOpen, dutyColumnId, isPIColumn]);

  const dutyTitleMap: Record<string, { gu: string; en: string }> = {
    communalPi: { gu: 'કોમ્યુનલ નાઈટ (PI)', en: 'Communal Night (PI)' },
    divisionPi: { gu: 'ડીવીઝન નાઈટ (PI)', en: 'Division Night (PI)' },
    cmMorchoPsi: { gu: 'CM મોરચો (PSI)', en: 'CM Morcho (PSI)' },
    campusPsi: { gu: 'કેમ્પસ નાઈટ (PSI)', en: 'Campus Night (PSI)' },
    vvipPsi: { gu: 'VVIP બંદોબસ્ત (PSI)', en: 'VVIP Bandobast (PSI)' },
  };

  const dutyTitle = dutyTitleMap[dutyColumnId] || { gu: dutyColumnId, en: dutyColumnId };

  // Filter officers based on search term and category
  const filteredOfficers = useMemo(() => {
    return officers.filter((off) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        off.name.toLowerCase().includes(term) ||
        off.squad.toLowerCase().includes(term) ||
        off.rank.toLowerCase().includes(term) ||
        off.phone.includes(term);
      
      const matchesCategory = activeFilter === 'ALL' || off.category === activeFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [officers, searchTerm, activeFilter]);

  if (!isOpen) return null;

  const handleSelectOfficer = (officer: Officer) => {
    // Save officer name (or squad if name is not set)
    const selectedValue = officer.name || officer.squad;
    onApplySwap(date, dutyColumnId, selectedValue);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSquad.trim()) {
      onApplySwap(date, dutyColumnId, customSquad.trim());
      onClose();
    }
  };

  // Find current officer details if matched
  const currentOfficer = officers.find(
    (o) => o.name === currentSquad || o.squad === currentSquad || o.id === currentSquad || formatSquadText(o.squad) === formatSquadText(currentSquad)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40 text-white shrink-0">
              <ArrowRightLeft className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/60 font-mono">
                  તારીખ: {date}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                  {lang === 'gu' ? dutyTitle.gu : dutyTitle.en}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-tight">
                {lang === 'gu' ? 'અધિકારી સ્વેપ / બદલો (Swip List View)' : 'Swap Duty Assignment'}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700"
            title="બંધ કરો"
          >
            <X size={22} />
          </button>
        </div>

        {/* Current Officer Status Banner */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">હાલમાં ફાળવેલ:</span>
            <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 font-mono">
              {currentOfficer ? `${currentOfficer.name} (${formatSquadText(currentOfficer.squad) || currentOfficer.squad})` : (formatSquadText(currentSquad) || currentSquad || 'કોઈ નહીં')}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles size={12} />
            યાદીમાંથી કોઈ પણ નામ પર ક્લિક કરો એટલે તરત બદલાઈ જશે
          </span>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder={lang === 'gu' ? 'નામ, સ્કોડ, હોદ્દો અથવા નંબર શોધો...' : 'Search name, squad, mobile...'}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white text-base sm:text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-950 border-2 border-slate-800 rounded-2xl p-1 shrink-0">
              {(['PI', 'PSI', 'ALL'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeFilter === cat 
                      ? (cat === 'PI' ? 'bg-blue-600 text-white shadow-lg' : cat === 'PSI' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-white')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? (lang === 'gu' ? 'બધા' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              ઉપલબ્ધ અધિકારીઓ: <strong className="text-white font-mono">{filteredOfficers.length}</strong>
            </span>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} />
              {showCustomInput ? 'યાદી જુઓ' : 'અન્ય સ્કોડ / કસ્ટમ નામ લખો'}
            </button>
          </div>

          {/* Optional Custom Manual Input */}
          {showCustomInput && (
            <form onSubmit={handleCustomSubmit} className="flex gap-2 p-3 bg-slate-950 rounded-2xl border border-blue-900/50">
              <input
                type="text"
                value={customSquad}
                onChange={(e) => setCustomSquad(e.target.value)}
                placeholder="દા.ત. સ્કોડ-૧૦ અથવા નવું નામ લખો..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                સેવ કરો
              </button>
            </form>
          )}
        </div>

        {/* Officers List View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 bg-slate-950/40 divide-y divide-slate-800/40">
          {filteredOfficers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <User size={48} className="mx-auto text-slate-700 opacity-40" />
              <p className="font-bold text-base text-slate-400">કોઈ મેળ ખાતા અધિકારી મળ્યા નથી</p>
              <p className="text-xs text-slate-500">શોધવાની વિગત બદલો અથવા 'બધા' (ALL) ટેબ પસંદ કરો</p>
            </div>
          ) : (
            filteredOfficers.map((off) => {
              const isCurrent = currentSquad === off.name || currentSquad === off.squad;

              return (
                <div
                  key={off.id}
                  onClick={() => handleSelectOfficer(off)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 text-left group ${
                    isCurrent 
                      ? 'bg-blue-600/20 border-blue-500/80 shadow-lg ring-2 ring-blue-500/30' 
                      : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-blue-500/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                      off.category === 'PI' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-colors' 
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors'
                    }`}>
                      {off.category}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          off.category === 'PI' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {off.category}
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
                          {formatSquadText(off.squad) || off.squad}
                        </span>
                        {off.rank && (
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            {off.rank}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-300 transition-colors truncate">
                        {off.name}
                      </h4>

                      {off.phone && (
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={12} className="text-slate-500" />
                          <span>{off.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrent ? (
                      <span className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                        <Check size={14} className="stroke-[3]" />
                        <span>હાલમાં સેટ</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-2 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 group-hover:border-blue-500 shadow-xs flex items-center gap-1.5">
                        <ArrowRightLeft size={13} />
                        <span>આ પસંદ કરો</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            સિલેક્ટ કર્યા બાદ રોસ્ટર અને Supabase માં તરત જ સેવ થઈ જશે.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-slate-700"
          >
            બંધ કરો
          </button>
        </div>

      </div>
    </div>
  );
};
