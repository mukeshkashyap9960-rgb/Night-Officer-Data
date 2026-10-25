import React, { useState } from 'react';
import { 
  Search, 
  ArrowRightLeft, 
  Filter, 
  Calendar as CalendarIcon,
  MessageSquare,
  ChevronRight,
  Shield,
  Download,
  ClipboardPaste,
  X,
  Check
} from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';

interface RosterTableProps {
  roster: DutyRow[];
  officersMap: Record<string, Officer>;
  officers?: Officer[];
  currentDateStr: string;
  onSendWhatsApp: (squad: string, dutyType: string, dutyTitleGu: string, date: string, day: string) => void;
  onPiBroadcast: (row: DutyRow) => void;
  onPsiBroadcast: (row: DutyRow, index: number) => void;
  onSwapDuty: (date: string, dutyColumnId: string) => void;
  onImportPaste: (pastedText: string, mode: 'append' | 'replace') => void;
  lang: 'gu' | 'en';
}

export const RosterTable: React.FC<RosterTableProps> = ({
  roster,
  officersMap,
  officers = [],
  currentDateStr,
  onSendWhatsApp,
  onPiBroadcast,
  onPsiBroadcast,
  onSwapDuty,
  onImportPaste,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pi' | 'psi'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '1-10' | '11-20' | '21-30'>('all');

  const filteredRoster = roster.filter((row) => {
    // Parse day number for 1-10, 11-20, 21-30 filter
    const dayNum = parseInt(row.date.split('/')[0], 10);
    if (dateRangeFilter === '1-10' && (dayNum < 1 || dayNum > 10)) return false;
    if (dateRangeFilter === '11-20' && (dayNum < 11 || dayNum > 20)) return false;
    if (dateRangeFilter === '21-30' && (dayNum < 21 || dayNum > 30)) return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      if (activeFilter === 'pi') return row.communalPi || row.divisionPi;
      if (activeFilter === 'psi') return row.cmMorchoPsi || row.campusPsi || row.vvipPsi;
      return true;
    }

    const matchesSearch = 
      row.communalPi.toLowerCase().includes(term) ||
      row.divisionPi.toLowerCase().includes(term) ||
      row.cmMorchoPsi.toLowerCase().includes(term) ||
      row.campusPsi.toLowerCase().includes(term) ||
      row.vvipPsi.toLowerCase().includes(term) ||
      row.date.toLowerCase().includes(term) ||
      row.dayName.toLowerCase().includes(term) ||
      // Also match officer name if available
      (officersMap[row.communalPi]?.name?.toLowerCase().includes(term)) ||
      (officersMap[row.divisionPi]?.name?.toLowerCase().includes(term)) ||
      (officersMap[row.cmMorchoPsi]?.name?.toLowerCase().includes(term)) ||
      (officersMap[row.campusPsi]?.name?.toLowerCase().includes(term)) ||
      (officersMap[row.vvipPsi]?.name?.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (activeFilter === 'pi') {
      return row.communalPi || row.divisionPi;
    }
    if (activeFilter === 'psi') {
      return row.cmMorchoPsi || row.campusPsi || row.vvipPsi;
    }
    return true;
  });

  const handleProcessImport = (mode: 'append' | 'replace') => {
    if (!pastedData.trim()) return;
    onImportPaste(pastedData, mode);
    setPastedData('');
    setIsImportModalOpen(false);
  };

  const renderCell = (squadOrName: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    // Find officer by map (indexed by squad & name) or search in officers array
    const officer = officersMap[squadOrName] || officers.find(o => o.name === squadOrName || o.squad === squadOrName);
    const displayName = officer ? officer.name : squadOrName;
    const squadBadge = officer ? officer.squad : squadOrName;

    return (
      <div 
        onClick={() => onSwapDuty(row.date, dutyKey)}
        className="group relative p-3.5 sm:p-4 bg-slate-950/40 hover:bg-blue-600/15 border border-slate-800/60 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-lg min-w-[190px]"
        title={lang === 'gu' ? `સ્વેપ કરવા માટે ક્લિક કરો (${row.date})` : `Click to swap (${row.date})`}
      >
        <div className="flex flex-col pr-12 min-h-[58px] justify-center">
          <span className="text-base sm:text-lg font-black text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">
            {displayName}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/30">
              {squadBadge}
            </span>
            {officer?.rank && (
              <span className="text-[10px] text-slate-400 font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                {officer.rank}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls - Always clearly visible and easy to tap */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSwapDuty(row.date, dutyKey);
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl shadow-md flex items-center gap-1 text-xs font-black cursor-pointer transition-all hover:scale-105 active:scale-95"
            title={lang === 'gu' ? 'સ્વેપ / બદલો' : 'Swap Officer'}
          >
            <ArrowRightLeft size={14} className="stroke-[2.5]" />
            <span className="hidden xl:inline text-[11px]">{lang === 'gu' ? 'સ્વેપ' : 'Swap'}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendWhatsApp(squadOrName, dutyKey, dutyTitle, row.date, row.dayName);
            }}
            className="p-2 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl border border-slate-700 hover:border-emerald-500 shadow-sm transition-all cursor-pointer"
            title="WhatsApp"
          >
            <MessageSquare size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row md:items-center justify-between gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder={lang === 'gu' ? 'તારીખ, સ્કોડ અથવા અધિકારીનું નામ શોધો...' : 'Search date, squad, or officer name...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
              {(['all', 'pi', 'psi'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? (lang === 'gu' ? 'બધા' : 'All') : f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Quick 1 to 30 Date Range Selector */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
              {([
                { key: 'all', labelGu: '૧-૩૦ તારીખ', labelEn: 'All (1-30)' },
                { key: '1-10', labelGu: '૧ થી ૧૦', labelEn: '1 to 10' },
                { key: '11-20', labelGu: '૧૧ થી ૨૦', labelEn: '11 to 20' },
                { key: '21-30', labelGu: '૨૧ થી ૩૦', labelEn: '21 to 30' },
              ] as const).map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDateRangeFilter(d.key)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    dateRangeFilter === d.key 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'gu' ? d.labelGu : d.labelEn}
                </button>
              ))}
            </div>

            <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 whitespace-nowrap hidden md:block border-l border-slate-800">
              {filteredRoster.length} / {roster.length} {lang === 'gu' ? 'દિવસો' : 'Days'}
            </div>
          </div>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-95 shrink-0"
          >
            <ClipboardPaste size={20} />
            {lang === 'gu' ? 'Excel માંથી ઇમ્પોર્ટ' : 'IMPORT SPREADSHEET'}
          </button>
        </div>

        {/* Quick Helper Banner */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-blue-300 font-bold">
            <span className="p-1 bg-blue-600/30 rounded-lg text-blue-400 font-mono">⚡ QUICK SWAP:</span>
            <span>{lang === 'gu' ? 'નીચે આપેલ ૧ થી ૩૦ તારીખના કોઈપણ ખાના પર અથવા સ્વેપ બટન પર ક્લિક કરો - તરત લિસ્ટ વ્યૂ ખુલશે!' : 'Click any slot or Swap button below to open fast List View for instant changes.'}</span>
          </div>
          <span className="text-amber-400 font-bold hidden sm:inline">
            {lang === 'gu' ? '૧-ક્લિકમાં અધિકારી બદલો' : '1-Click Officer Selection'}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-center">
                <th className="py-6 px-6 text-xs sm:text-sm font-black text-slate-300 uppercase tracking-wider text-left">
                  {lang === 'gu' ? 'તારીખ અને વાર' : 'Date & Day'}
                </th>
                <th className="py-6 px-3 text-xs sm:text-sm font-black text-blue-400 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'કોમ્યુનલ (PI)' : 'Communal (PI)'}
                </th>
                <th className="py-6 px-3 text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'ડીવીઝન (PI)' : 'Division (PI)'}
                </th>
                <th className="py-6 px-3 text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'CM મોરચો (PSI)' : 'CM Route (PSI)'}
                </th>
                <th className="py-6 px-3 text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'કેમ્પસ (PSI)' : 'Campus (PSI)'}
                </th>
                <th className="py-6 px-3 text-xs sm:text-sm font-black text-rose-400 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'VVIP (PSI)' : 'VVIP (PSI)'}
                </th>
                <th className="py-6 px-6 text-center text-xs sm:text-sm font-black text-slate-300 uppercase tracking-wider border-l border-slate-800/50">
                  {lang === 'gu' ? 'પત્રક / Actions' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-bold">
              {filteredRoster.map((row, idx) => (
                <tr 
                  key={row.date} 
                  className={`group transition-all ${row.date === currentDateStr ? 'bg-blue-600/10' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-10 px-10">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-white leading-none mb-2 tracking-tighter">{row.dayName}</span>
                      <span className="text-base font-mono font-black text-blue-500 tracking-widest uppercase">{row.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 border-l border-slate-800/30">{renderCell(row.communalPi, 'communalPi', 'કોમ્યુનલ નાઈટ', row)}</td>
                  <td className="py-4 px-3 border-l border-slate-800/30">{renderCell(row.divisionPi, 'divisionPi', 'ડીવીઝન નાઈટ', row)}</td>
                  <td className="py-4 px-3 border-l border-slate-800/30">{renderCell(row.cmMorchoPsi, 'cmMorchoPsi', 'CM મોરચો', row)}</td>
                  <td className="py-4 px-3 border-l border-slate-800/30">{renderCell(row.campusPsi, 'campusPsi', 'કેમ્પસ નાઈટ', row)}</td>
                  <td className="py-4 px-3 border-l border-slate-800/30">{renderCell(row.vvipPsi, 'vvipPsi', 'VVIP બંદોબસ્ત', row)}</td>
                  <td className="py-10 px-10 text-right border-l border-slate-800/30">
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => onPiBroadcast(row)}
                        className="w-full px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-600/20 shadow-sm"
                      >
                        PI પત્રક
                      </button>
                      <button 
                        onClick={() => onPsiBroadcast(row, idx)}
                        className="w-full px-4 py-2 bg-emerald-600/10 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-600/20 shadow-sm"
                      >
                        PSI પત્રક
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spreadsheet Paste Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Import from Spreadsheet</h3>
                <p className="text-slate-500 text-base font-bold mt-1 uppercase tracking-widest">Excel / Google Sheets Copy-Paste</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-3 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 rounded-2xl">
                <X size={28} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl text-blue-300 text-sm font-bold leading-relaxed">
                ℹ️ Copy data from Excel (7 columns) and paste it below. You can choose to add to existing data or replace everything.
              </div>
              <textarea
                className="w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-[2rem] p-8 text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-base leading-relaxed"
                placeholder="Paste rows here..."
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-8 py-4 rounded-2xl text-slate-400 hover:text-white font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcessImport('append')}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all border border-slate-700 cursor-pointer shadow-xl active:scale-95"
                  >
                    APPEND DATA
                  </button>
                  <button
                    onClick={() => handleProcessImport('replace')}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/30 cursor-pointer active:scale-95"
                  >
                    <Check size={24} />
                    REPLACE ALL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
