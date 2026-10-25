import React, { useState } from 'react';
import { 
  Search, 
  ArrowRightLeft, 
  Filter, 
  Calendar as CalendarIcon,
  MessageSquare,
  ChevronRight,
  Shield,
  Download
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
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const renderCell = (squad: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    const officer = officersMap[squad];
    return (
      <div className="group relative py-3 px-4 hover:bg-blue-600/5 transition-all cursor-default rounded-lg">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white leading-tight mb-1">{officer ? officer.name : squad}</span>
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">{squad}</span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
          <button
            onClick={() => onSendWhatsApp(squad, dutyKey, dutyTitle, row.date, row.dayName)}
            className="p-1.5 bg-slate-900 border border-slate-700 text-emerald-500 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
          >
            <MessageSquare size={12} />
          </button>
          <button
            onClick={() => onSwapDuty(row.date, dutyKey)}
            className="p-1.5 bg-slate-900 border border-slate-700 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
          >
            <ArrowRightLeft size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder={lang === 'gu' ? 'તારીખ, સ્કોડ અથવા અધિકારી શોધો...' : 'Search roster...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">
          {filteredRoster.length} Entries Found
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="py-5 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="py-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Communal (PI)</th>
                <th className="py-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Division (PI)</th>
                <th className="py-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">CM Route (PSI)</th>
                <th className="py-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campus (PSI)</th>
                <th className="py-5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">VVIP (PSI)</th>
                <th className="py-5 px-6 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRoster.map((row, idx) => (
                <tr 
                  key={row.date} 
                  className={`group transition-all ${row.date === currentDateStr ? 'bg-blue-600/5' : 'hover:bg-slate-800/20'}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{row.dayName}</span>
                      <span className="text-[10px] font-mono text-slate-500">{row.date}</span>
                    </div>
                  </td>
                  <td className="py-2 px-1">{renderCell(row.communalPi, 'communalPi', 'કોમ્યુનલ નાઈટ', row)}</td>
                  <td className="py-2 px-1">{renderCell(row.divisionPi, 'divisionPi', 'ડીવીઝન નાઈટ', row)}</td>
                  <td className="py-2 px-1">{renderCell(row.cmMorchoPsi, 'cmMorchoPsi', 'CM મોરચો', row)}</td>
                  <td className="py-2 px-1">{renderCell(row.campusPsi, 'campusPsi', 'કેમ્પસ નાઈટ', row)}</td>
                  <td className="py-2 px-1">{renderCell(row.vvipPsi, 'vvipPsi', 'VVIP બંદોબસ્ત', row)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onPiBroadcast(row)}
                        className="px-2 py-1 bg-blue-600/10 text-blue-400 rounded text-[9px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-blue-600/20"
                      >
                        PI
                      </button>
                      <button 
                        onClick={() => onPsiBroadcast(row, idx)}
                        className="px-2 py-1 bg-emerald-600/10 text-emerald-400 rounded text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-600/20"
                      >
                        PSI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
