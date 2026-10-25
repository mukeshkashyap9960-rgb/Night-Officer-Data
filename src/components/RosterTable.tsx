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
  onImportPaste: (pastedText: string) => void;
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

  const filteredRoster = roster.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      row.communalPi.toLowerCase().includes(term) ||
      row.divisionPi.toLowerCase().includes(term) ||
      row.cmMorchoPsi.toLowerCase().includes(term) ||
      row.campusPsi.toLowerCase().includes(term) ||
      row.vvipPsi.toLowerCase().includes(term) ||
      row.date.toLowerCase().includes(term) ||
      row.dayName.toLowerCase().includes(term)
    );
  });

  const handleProcessImport = () => {
    if (!pastedData.trim()) return;
    onImportPaste(pastedData);
    setPastedData('');
    setIsImportModalOpen(false);
  };

  const renderCell = (squad: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    const officer = officersMap[squad];
    return (
      <div className="group relative py-4 px-5 hover:bg-blue-600/10 transition-all cursor-default rounded-xl border border-transparent hover:border-blue-500/20">
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-white leading-tight mb-1">{officer ? officer.name : squad}</span>
          <span className="text-[13px] text-slate-400 font-mono font-bold uppercase tracking-tight">{squad}</span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1.5 transition-all">
          <button
            onClick={() => onSendWhatsApp(squad, dutyKey, dutyTitle, row.date, row.dayName)}
            className="p-2 bg-slate-900 border border-slate-700 text-emerald-500 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={() => onSwapDuty(row.date, dutyKey)}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-lg"
          >
            <ArrowRightLeft size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center flex-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder={lang === 'gu' ? 'તારીખ, સ્કોડ અથવા અધિકારી શોધો...' : 'Search roster...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest px-4 whitespace-nowrap">
            {filteredRoster.length} Entries Found
          </div>
        </div>

        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
        >
          <ClipboardPaste size={18} />
          Spreadsheet Paste Import
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="py-6 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Day</th>
                <th className="py-6 px-4 text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Communal (PI)</th>
                <th className="py-6 px-4 text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Division (PI)</th>
                <th className="py-6 px-4 text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">CM Route (PSI)</th>
                <th className="py-6 px-4 text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">Campus (PSI)</th>
                <th className="py-6 px-4 text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50 text-center">VVIP (PSI)</th>
                <th className="py-6 px-8 text-right text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRoster.map((row, idx) => (
                <tr 
                  key={row.date} 
                  className={`group transition-all ${row.date === currentDateStr ? 'bg-blue-600/10' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-6 px-8">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-white leading-none mb-1">{row.dayName}</span>
                      <span className="text-sm font-mono font-bold text-blue-500 tracking-wider">{row.date}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 border-l border-slate-800/30">{renderCell(row.communalPi, 'communalPi', 'કોમ્યુનલ નાઈટ', row)}</td>
                  <td className="py-2 px-2 border-l border-slate-800/30">{renderCell(row.divisionPi, 'divisionPi', 'ડીવીઝન નાઈટ', row)}</td>
                  <td className="py-2 px-2 border-l border-slate-800/30">{renderCell(row.cmMorchoPsi, 'cmMorchoPsi', 'CM મોરચો', row)}</td>
                  <td className="py-2 px-2 border-l border-slate-800/30">{renderCell(row.campusPsi, 'campusPsi', 'કેમ્પસ નાઈટ', row)}</td>
                  <td className="py-2 px-2 border-l border-slate-800/30">{renderCell(row.vvipPsi, 'vvipPsi', 'VVIP બંદોબસ્ત', row)}</td>
                  <td className="py-5 px-8 text-right border-l border-slate-800/30">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onPiBroadcast(row)}
                        className="px-3 py-1.5 bg-blue-600/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-600/20 shadow-sm"
                      >
                        PI પત્રક
                      </button>
                      <button 
                        onClick={() => onPsiBroadcast(row, idx)}
                        className="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-600/20 shadow-sm"
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
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="text-2xl font-black text-white">Import from Spreadsheet</h3>
                <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Excel / Google Sheets Copy-Paste</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-xl text-blue-300 text-xs font-bold leading-relaxed">
                ℹ️ Copy data from Excel (7 columns: Date, Day, Communal PI, Division PI, CM PSI, Campus PSI, VVIP PSI) and paste it here. Tabs or commas are supported.
              </div>
              <textarea
                className="w-full h-64 bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-sm leading-relaxed"
                placeholder="Paste your spreadsheet rows here..."
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessImport}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black flex items-center gap-3 transition-all shadow-xl shadow-emerald-900/30 cursor-pointer active:scale-95"
                >
                  <Check size={20} />
                  SAVE TO SUPABASE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
