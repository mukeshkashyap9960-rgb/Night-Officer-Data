import React, { useState, useMemo, useRef } from 'react';
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
  Upload,
  FileSpreadsheet,
  Printer,
  FileDown,
  CheckCircle2,
  X,
  Check
} from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';
import { formatSquadText, resolveOfficerAndSquad } from '../utils/whatsapp';

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
  onExportRoster?: (data: DutyRow[], filterType: 'all' | 'pi' | 'psi') => void;
  onDownloadTemplate?: () => void;
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
  onExportRoster,
  onDownloadTemplate,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Calculate detected rows count and preview info from pasted/uploaded content
  const detectedInfo = useMemo(() => {
    if (!pastedData.trim()) return { count: 0, firstDate: '', lastDate: '' };
    const lines = pastedData.trim().split(/\r?\n/);
    const headerKeywords = ['date', 'day', 'communal', 'division', 'તારીખ', 'વાર', 'કોમ્યુનલ', 'ડીવીઝન', 'morcho', 'મોરચો'];
    const validDates: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = (line.includes('\t') ? line.split('\t') : line.split(/[,;]/))
        .map(c => c.trim().replace(/^"|"$/g, ''));
      if (i === 0 && cols.some(c => headerKeywords.some(k => c.toLowerCase().includes(k)))) {
        continue;
      }
      if (cols.length >= 6) {
        validDates.push(cols[0]);
      }
    }
    return {
      count: validDates.length,
      firstDate: validDates[0] || '',
      lastDate: validDates[validDates.length - 1] || ''
    };
  }, [pastedData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = (mode: 'append' | 'replace') => {
    if (!pastedData.trim()) return;
    onImportPaste(pastedData, mode);
    setPastedData('');
    setImportFileName('');
    setIsImportModalOpen(false);
  };

  const renderCell = (squadOrName: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    const resolved = resolveOfficerAndSquad(squadOrName, officersMap, officers);
    const displayName = resolved.name || squadOrName;
    const squadBadge = resolved.squadFormatted || formatSquadText(squadOrName) || squadOrName;

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
            {resolved.rank && (
              <span className="text-[10px] text-slate-400 font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                {resolved.rank}
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

          {/* Action Buttons: 1 to 30 Download, Import, and Print */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button 
                onClick={() => onExportRoster?.(filteredRoster, activeFilter)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-900/30 cursor-pointer active:scale-95"
                title={lang === 'gu' ? 'ફિલ્ટર કરેલ ડ્યુટી પત્રક ડાઉનલોડ કરો (Excel / CSV)' : 'Download filtered Duty Roster (Excel / CSV)'}
              >
                <Download size={20} />
                <span>{lang === 'gu' ? 'પત્રક ડાઉનલોડ' : 'DOWNLOAD ROSTER'}</span>
              </button>

            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95 shrink-0"
              title={lang === 'gu' ? 'ડ્યુટી પત્રક ઇમ્પોર્ટ કરો (Excel / CSV / Paste)' : 'Import Duty Roster (Excel / CSV / Paste)'}
            >
              <ClipboardPaste size={20} />
              <span>{lang === 'gu' ? 'ઇમ્પોર્ટ પત્રક (Import)' : 'IMPORT ROSTER'}</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-3.5 rounded-2xl font-black transition-all border border-slate-800 cursor-pointer active:scale-95 hidden sm:flex items-center justify-center shadow-md"
              title={lang === 'gu' ? 'પ્રિન્ટ પત્રક' : 'Print Roster'}
            >
              <Printer size={20} />
            </button>
          </div>
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

      {/* Spreadsheet / File Import Modal with 1 to 30 Download Option */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[92vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                  <FileSpreadsheet size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {lang === 'gu' ? 'ડ્યુટી પત્રક ઇમ્પોર્ટ (૧ થી ૩૦ પત્રક)' : 'Import Duty Roster (1 to 30)'}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold mt-0.5">
                    {lang === 'gu' ? 'Excel / CSV ફાઇલ અપલોડ કરો અથવા ડેટા પેસ્ટ કરો' : 'Upload Excel / CSV file or paste spreadsheet data'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPastedData('');
                  setImportFileName('');
                }} 
                className="p-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
              {/* Quick Template Download Card - Directly fulfills user request */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Download size={16} className="text-blue-400" />
                    {lang === 'gu' ? '૧ થી ૩૦ પત્રક ડાઉનલોડ કરો:' : 'Download 1 to 30 Roster:'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === 'gu' ? 'Excel માં ફેરફાર કરવા માટે હાલનો પત્રક અથવા ખાલી ટેમ્પલેટ ડાઉનલોડ કરો' : 'Download existing 1-30 roster or blank template for editing in Excel'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onExportRoster && (
                    <button
                      type="button"
                      onClick={() => onExportRoster(roster, 'all')}
                      className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold rounded-xl border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Download size={14} />
                      {lang === 'gu' ? '૧ થી ૩૦ પત્રક (CSV)' : 'Current 1-30 CSV'}
                    </button>
                  )}
                  {onDownloadTemplate && (
                    <button
                      type="button"
                      onClick={onDownloadTemplate}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <FileDown size={14} />
                      {lang === 'gu' ? 'બ્લેન્ક ટેમ્પલેટ' : 'Blank Template'}
                    </button>
                  )}
                </div>
              </div>

              {/* Upload File Box */}
              <div className="grid grid-cols-1 gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".csv,.tsv,.txt" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/60 hover:bg-emerald-950/10 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                >
                  <div className="p-3 bg-slate-900 group-hover:bg-emerald-500/20 rounded-xl text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <Upload size={22} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {importFileName ? `પસંદ કરેલ ફાઇલ: ${importFileName}` : (lang === 'gu' ? 'કમ્પ્યુટરમાંથી CSV / Excel ફાઇલ પસંદ કરો' : 'Click to select CSV / Excel file')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {importFileName ? (lang === 'gu' ? 'બીજી ફાઇલ પસંદ કરવા અહીં ક્લિક કરો' : 'Click to change file') : '.csv, .tsv, અથવા .txt ફાઇલ સપોર્ટ કરે છે'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Textarea for Paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">
                    {lang === 'gu' ? 'અથવા Excel માંથી ડેટા કોપી કરી અહીં પેસ્ટ કરો:' : 'Or paste rows directly from Excel / Google Sheets:'}
                  </span>
                  {detectedInfo.count > 0 && (
                    <span className="text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      <CheckCircle2 size={12} />
                      {detectedInfo.count} {lang === 'gu' ? 'દિવસો ડિટેક્ટ થયા' : 'days detected'}
                      {detectedInfo.firstDate && ` (${detectedInfo.firstDate} થી ${detectedInfo.lastDate})`}
                    </span>
                  )}
                </div>
                <textarea
                  className="w-full h-44 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono text-xs leading-relaxed"
                  placeholder="તારીખ, વાર, કોમ્યુનલ (PI), ડીવીઝન (PI), CM મોરચો (PSI), કેમ્પસ (PSI), VVIP (PSI)&#10;1/11/2026	રવિવાર	સ્કોડ - ૦૪	સ્કોડ - ૦૫	સ્કોડ - ૦૯	સ્કોડ - ૦૧	સ્કોડ - ૦૬"
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                />
              </div>

              {/* Instructions format note */}
              <div className="text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                <span className="font-bold text-amber-400">💡 કોલમ ફોર્મેટ:</span> તારીખ | વાર | કોમ્યુનલ નાઈટ PI | ડીવીઝન નાઈટ PI | CM મોરચો PSI | કેમ્પસ નાઈટ PSI | VVIP બંદોબસ્ત PSI.
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPastedData('');
                  setImportFileName('');
                }}
                className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold text-sm transition-all cursor-pointer"
              >
                {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
              </button>
              
              <button
                type="button"
                disabled={!pastedData.trim()}
                onClick={() => handleProcessImport('append')}
                className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border cursor-pointer active:scale-95 ${
                  pastedData.trim()
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                {lang === 'gu' ? 'ડેટા ઉમેરો (Append)' : 'APPEND DATA'}
              </button>

              <button
                type="button"
                disabled={!pastedData.trim()}
                onClick={() => handleProcessImport('replace')}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer active:scale-95 ${
                  pastedData.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Check size={18} />
                <span>{lang === 'gu' ? '૧ થી ૩૦ પત્રક રિપ્લેસ કરો (Replace All)' : 'REPLACE ALL 1-30'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
