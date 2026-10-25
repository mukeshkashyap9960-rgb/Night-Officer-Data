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

  const filteredRoster = roster.filter((row) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm.trim() || 
      row.communalPi.toLowerCase().includes(term) ||
      row.divisionPi.toLowerCase().includes(term) ||
      row.cmMorchoPsi.toLowerCase().includes(term) ||
      row.campusPsi.toLowerCase().includes(term) ||
      row.vvipPsi.toLowerCase().includes(term) ||
      row.date.toLowerCase().includes(term) ||
      row.dayName.toLowerCase().includes(term);

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

  const renderCell = (squad: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    const officer = officersMap[squad];
    return (
      <div className="group relative py-6 px-8 hover:bg-blue-600/10 transition-all cursor-default rounded-[2rem] border border-transparent hover:border-blue-500/30 shadow-sm">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white leading-tight mb-2 tracking-tight">{officer ? officer.name : squad}</span>
          <span className="text-lg text-slate-400 font-mono font-black uppercase tracking-widest">{squad}</span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
          <button
            onClick={() => onSendWhatsApp(squad, dutyKey, dutyTitle, row.date, row.dayName)}
            className="p-3 bg-slate-900 border border-slate-700 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-xl"
          >
            <MessageSquare size={18} />
          </button>
          <button
            onClick={() => onSwapDuty(row.date, dutyKey)}
            className="p-3 bg-slate-900 border border-slate-700 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row md:items-center justify-between gap-4">
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center flex-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder={lang === 'gu' ? 'તારીખ, સ્કોડ અથવા અધિકારી શોધો...' : 'Search roster...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
            {(['all', 'pi', 'psi'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="text-xs font-black text-slate-500 uppercase tracking-widest px-4 whitespace-nowrap hidden md:block border-l border-slate-800">
            {filteredRoster.length} Entries
          </div>
        </div>

        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20 cursor-pointer active:scale-95"
        >
          <ClipboardPaste size={22} />
          {lang === 'gu' ? 'Excel માંથી ઇમ્પોર્ટ' : 'IMPORT SPREADSHEET'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="py-7 px-10 text-sm font-black text-slate-400 uppercase tracking-widest">Date & Day</th>
                <th className="py-7 px-4 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Communal (PI)</th>
                <th className="py-7 px-4 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Division (PI)</th>
                <th className="py-7 px-4 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">CM Route (PSI)</th>
                <th className="py-7 px-4 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Campus (PSI)</th>
                <th className="py-7 px-4 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">VVIP (PSI)</th>
                <th className="py-7 px-10 text-right text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">Actions</th>
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
