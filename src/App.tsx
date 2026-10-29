import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Shield, 
  Clock, 
  Languages, 
  CheckCircle,
  Bell,
  LogOut,
  Download,
  MessageSquare
} from 'lucide-react';
import { DutyRow, Officer, AlertConfig } from './types/roster';
import { 
  NOVEMBER_2026_ROSTER, 
  DEFAULT_OFFICERS, 
  DUTY_COLUMNS, 
  generateMonthRoster 
} from './data/rosterData';
import { Header } from './components/Header';
import { TodayDutyCard } from './components/TodayDutyCard';
import { RosterTable } from './components/RosterTable';
import { WhatsAppModal } from './components/WhatsAppModal';
import { DutySwapModal } from './components/DutySwapModal';
import { OfficerDirectory } from './components/OfficerDirectory';
import { OfficerListView } from './components/OfficerListView';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { DutyAnalyticsModal } from './components/DutyAnalyticsModal';
import { RollCallModal } from './components/RollCallModal';
import { PrintRosterView } from './components/PrintRosterView';
import { alertSound, showBrowserNotification } from './utils/audioAlert';
import { 
  createIndividualDutyMessage, 
  createPiBroadcastMessage, 
  createPsiBroadcastMessage,
  formatSquadText,
  formatDutyForExport,
  resolveOfficerAndSquad
} from './utils/whatsapp';
import { supabase, TABLES } from './utils/supabaseClient';
import { 
  fetchAndSyncOfficers, 
  fetchAndSyncRoster, 
  saveRosterToLocal,
  loadOfficersFromLocal,
  loadRosterFromLocal
} from './utils/storage';

function Sidebar({ lang, isOpen, onClose }: { lang: 'gu' | 'en', isOpen: boolean, onClose: () => void }) {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: lang === 'gu' ? 'ડેશબોર્ડ' : 'Dashboard' },
    { path: '/roster', icon: TableIcon, label: lang === 'gu' ? 'ડ્યુટી પત્રક (ટેબલ વ્યૂ)' : 'Duty Roster (Table View)' },
    { path: '/list', icon: Users, label: lang === 'gu' ? 'અધિકારી લિસ્ટ (ટેબલ વ્યૂ)' : 'Officer List (Table View)' },
    { path: '/officers', icon: Settings, label: lang === 'gu' ? 'ડાયરેક્ટરી સેટઅપ' : 'Manage Officers' },
    { path: '/analytics', icon: BarChart3, label: lang === 'gu' ? 'એનાલિટિક્સ' : 'Analytics' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 h-screen transition-transform duration-300 transform lg:translate-x-0 lg:static lg:flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/30">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">ક્રાઇમ બ્રાન્ચ</h1>
                <p className="text-slate-500 text-[11px] uppercase tracking-widest font-extrabold">Crime Branch Night Duty</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold transition-all border ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-900">
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-blue-500" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">System Connection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
              <span className="text-sm text-slate-200 font-bold tracking-tight">
                {supabase ? 'Cloud Synchronized' : 'Local Persistent Storage'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState<'gu' | 'en'>('gu');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [roster, setRoster] = useState<DutyRow[]>(() => loadRosterFromLocal() || NOVEMBER_2026_ROSTER);
  const [officers, setOfficers] = useState<Officer[]>(() => loadOfficersFromLocal() || DEFAULT_OFFICERS);
  const buildOfficersMap = (list: Officer[]): Record<string, Officer> => {
    const map: Record<string, Officer> = {};
    list.forEach(o => {
      if (o.squad) {
        map[o.squad] = o;
        const fmt = formatSquadText(o.squad);
        if (fmt) map[fmt] = o;
      }
      if (o.name) map[o.name] = o;
      if (o.id) map[o.id] = o;
      if (o.phone) map[o.phone] = o;
      if (o.branch) {
        map[o.branch] = o;
        const fmtBranch = formatSquadText(o.branch);
        if (fmtBranch) map[fmtBranch] = o;
      }
    });
    return map;
  };

  const [officersMap, setOfficersMap] = useState<Record<string, Officer>>(() => {
    const initialOfficers = loadOfficersFromLocal() || DEFAULT_OFFICERS;
    return buildOfficersMap(initialOfficers);
  });
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
    alertTime: '18:00',
    reminderTemplateGu: '',
    autoAlertEnabled: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayStr = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    const initialRoster = loadRosterFromLocal() || NOVEMBER_2026_ROSTER;
    const match = initialRoster.find(r => r.date === todayStr);
    return match ? match.date : (initialRoster[0]?.date || '1/11/2026');
  });

  const [whatsAppModal, setWhatsAppModal] = useState({ isOpen: false, title: '', recipientName: '', recipientPhone: '', message: '' });
  const [swapModal, setSwapModal] = useState({ isOpen: false, date: '', dutyColumnId: '', currentSquad: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);
  const [isRollCallOpen, setIsRollCallOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<'table' | 'card'>('table');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    initializeData();

    // Listen to global officer updates (from import, add, edit, delete in any component)
    const handleOfficersUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setOfficers(e.detail);
        setOfficersMap(buildOfficersMap(e.detail));
      }
    };

    const handleRosterUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setRoster(e.detail);
      }
    };

    window.addEventListener('officers_updated', handleOfficersUpdated);
    window.addEventListener('roster_updated', handleRosterUpdated);

    return () => {
      clearInterval(timer);
      window.removeEventListener('officers_updated', handleOfficersUpdated);
      window.removeEventListener('roster_updated', handleRosterUpdated);
    };
  }, []);

  async function initializeData() {
    setLoading(true);
    
    // Fetch and sync officers from persistent storage & Supabase
    const officersList = await fetchAndSyncOfficers();
    setOfficers(officersList);
    setOfficersMap(buildOfficersMap(officersList));

    // Fetch and sync roster
    const rosterList = await fetchAndSyncRoster();
    setRoster(rosterList);

    setLoading(false);
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isNightShiftActive = useMemo(() => {
    const hour = currentDate.getHours();
    return hour >= 20 || hour < 8;
  }, [currentDate]);

  const selectedDutyRow = useMemo(() => {
    return roster.find(r => r.date === selectedDate) || roster[0] || NOVEMBER_2026_ROSTER[0];
  }, [roster, selectedDate]);

  const handleOpenIndividualWhatsApp = (squad: string, dutyTypeKey: string, dutyTitleGu: string, dateParam?: string, dayParam?: string) => {
    const date = dateParam || selectedDutyRow.date;
    const day = dayParam || selectedDutyRow.dayName;
    const dutyRowForDate = roster.find(r => r.date === date) || selectedDutyRow;
    const officer = officersMap[squad] || officers.find(o => o.name === squad || o.squad === squad || o.id === squad) || null;

    const message = createIndividualDutyMessage({ 
      officer, 
      squadText: squad, 
      dutyTitleGu, 
      date, 
      dayName: day,
      divisionArea: dutyRowForDate?.divisionArea,
      officersMap,
      officersList: officers 
    });
    setWhatsAppModal({ 
      isOpen: true, 
      title: `${dutyTitleGu} - WhatsApp`, 
      recipientName: officer ? `${officer.name} (${formatSquadText(officer.squad) || officer.squad})` : squad, 
      recipientPhone: officer ? officer.phone : '', 
      message 
    });
  };

  const handleOpenPiBroadcast = (row: DutyRow) => {
    const message = createPiBroadcastMessage({ row, officersMap, officersList: officers });
    setWhatsAppModal({ isOpen: true, title: `PI નાઈટ ડ્યુટી પત્રક (ક્રાઇમ બ્રાન્ચ)`, recipientName: 'PI ગ્રૂપ', recipientPhone: '', message });
  };

  const handleOpenPsiBroadcast = (row: DutyRow, rowIndex: number) => {
    const nextRow = roster[rowIndex + 1];
    const message = createPsiBroadcastMessage({ row, nextRow, officersMap, officersList: officers });
    setWhatsAppModal({ isOpen: true, title: `PSI નાઈટ ડ્યુટી પત્રક (ક્રાઇમ બ્રાન્ચ)`, recipientName: 'PSI ગ્રૂપ', recipientPhone: '', message });
  };

  const handleImportPaste = async (text: string, mode: 'append' | 'replace') => {
    const lines = text.trim().split('\n');
    const newRows: DutyRow[] = [];

    const headerKeywords = ['date', 'day', 'communal', 'division', 'તારીખ', 'વાર', 'કોમ્યુનલ', 'ડીવીઝન'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(/\t|,/).map(c => c.trim().replace(/^"|"$/g, ''));
      
      if (i === 0) {
        const isHeader = cols.some(c => headerKeywords.some(k => c.toLowerCase().includes(k)));
        if (isHeader) continue;
      }

      if (cols.length >= 6) {
        newRows.push({
          date: cols[0],
          dayName: cols[1],
          dayNameEn: cols[1],
          communalPi: cols[2],
          divisionPi: cols[3],
          cmMorchoPsi: cols[4],
          campusPsi: cols[5],
          vvipPsi: cols[6] || '',
        });
      }
    }

    if (newRows.length > 0) {
      const finalRoster = mode === 'replace' ? newRows : [...roster, ...newRows];
      setRoster(finalRoster);
      saveRosterToLocal(finalRoster);
      
      if (supabase) {
        try {
          if (mode === 'replace') {
            const { error: delError } = await supabase.from(TABLES.ROSTER).delete().neq('date', 'DELETE_ALL_HACK');
            if (delError) throw delError;
          }

          const { error: upsertError } = await supabase.from(TABLES.ROSTER).upsert(
            newRows.map(r => ({
              date: r.date,
              day_name: r.dayName,
              communal_pi: r.communalPi,
              division_pi: r.divisionPi,
              cm_morcho_psi: r.cmMorchoPsi,
              campus_psi: r.campusPsi,
              vvip_psi: r.vvipPsi
            })),
            { onConflict: 'date' }
          );
          
          if (upsertError) throw upsertError;
          
          showToast(`Successfully ${mode}ed ${newRows.length} rows in Supabase!`);
          alert(`Import Successful! ${newRows.length} days synced.`);
        } catch (err: any) {
          console.error('Supabase Roster Error:', err);
          alert(`Server Error: ${err.message || 'Verification Failed'}\n\nCheck if your Supabase table "NightRoster" exists and RLS policies are active.`);
        }
      } else {
        showToast(`Imported ${newRows.length} rows (${mode} mode - permanently saved)`);
      }
    }
  };

  const handleApplySwap = async (date: string, dutyColumnId: string, newSquad: string) => {
    const updatedRoster = roster.map(row => row.date === date ? { ...row, [dutyColumnId]: newSquad } : row);
    setRoster(updatedRoster);
    saveRosterToLocal(updatedRoster);

    // Save to Supabase using explicit snake_case column names
    const targetRow = updatedRoster.find(r => r.date === date);
    if (targetRow && supabase) {
      try {
        const { error } = await supabase.from(TABLES.ROSTER).upsert([
          {
            date: targetRow.date,
            day_name: targetRow.dayName,
            communal_pi: targetRow.communalPi,
            division_pi: targetRow.divisionPi,
            cm_morcho_psi: targetRow.cmMorchoPsi,
            campus_psi: targetRow.campusPsi,
            vvip_psi: targetRow.vvipPsi,
          }
        ], { onConflict: 'date' });

        if (error) {
          console.error('Supabase swap error:', error);
        }
      } catch (err) {
        console.error('Failed to sync swap with Supabase:', err);
      }
    }

    if (alertConfig.soundEnabled) alertSound.playSoftBeep();
    showToast(`તારીખ ${date} માટે ડ્યુટી સફળતાપૂર્વક બદલાઈ ગઈ.`);
  };

  const handleUpdateDivisionArea = async (date: string, area: string) => {
    const updatedRoster = roster.map(row => row.date === date ? { ...row, divisionArea: area } : row);
    setRoster(updatedRoster);
    saveRosterToLocal(updatedRoster);

    const targetRow = updatedRoster.find(r => r.date === date);
    if (targetRow && supabase) {
      try {
        await supabase.from(TABLES.ROSTER).upsert([
          {
            date: targetRow.date,
            day_name: targetRow.dayName,
            communal_pi: targetRow.communalPi,
            division_pi: targetRow.divisionPi,
            cm_morcho_psi: targetRow.cmMorchoPsi,
            campus_psi: targetRow.campusPsi,
            vvip_psi: targetRow.vvipPsi,
            division_area: targetRow.divisionArea || null,
          }
        ], { onConflict: 'date' });
      } catch (err) {
        console.error('Supabase division area error:', err);
      }
    }

    showToast(lang === 'gu' ? `તારીખ ${date} માટે ડીવીજન વિસ્તાર અપડેટ થઈ ગયો.` : `Division area updated for ${date}.`);
  };

  const handleExportCSV = (data?: DutyRow[], filterType: 'all' | 'pi' | 'psi' = 'all') => {
    const exportData = data || roster;
    
    let headers = ['તારીખ', 'વાર'];
    if (filterType === 'all' || filterType === 'pi') {
      headers.push('કોમ્યુનલ નાઈટ (PI)', 'ડીવીઝન નાઈટ (PI)');
    }
    if (filterType === 'all' || filterType === 'psi') {
      headers.push('CM મોરચો (PSI)', 'કેમ્પસ નાઈટ (PSI)');
    }

    const rows = exportData.map(r => {
      const row = [`"${r.date}"`, `"${r.dayName}"`];
      if (filterType === 'all' || filterType === 'pi') {
        row.push(
          `"${formatDutyForExport(r.communalPi, officersMap, officers, 'PI શ્રી, સ્કોડ-૦૧').replace(/"/g, '""')}"`,
          `"${formatDutyForExport(r.divisionPi, officersMap, officers, 'PI શ્રી, સ્કોડ-૦૮').replace(/"/g, '""')}"`
        );
      }
      if (filterType === 'all' || filterType === 'psi') {
        row.push(
          `"${formatDutyForExport(r.cmMorchoPsi, officersMap, officers, 'સ્કોડ-૦૯').replace(/"/g, '""')}"`,
          `"${formatDutyForExport(r.campusPsi, officersMap, officers, 'સ્કોડ-૦૧').replace(/"/g, '""')}"`
        );
      }
      return row;
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
    const typeLabel = filterType === 'all' ? 'Full' : filterType.toUpperCase();
    link.download = `Crime_Branch_Duty_Roster_${typeLabel}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'gu' ? `${typeLabel} ડ્યુટી પત્રક ડાઉનલોડ થઈ ગયું!` : `${typeLabel} Duty Roster downloaded!`);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'તારીખ',
      'વાર',
      'કોમ્યુનલ નાઈટ (PI)',
      'ડીવીઝન નાઈટ (PI)',
      'CM મોરચો (PSI)',
      'કેમ્પસ નાઈટ (PSI)'
    ];
    const dayNamesGu = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];
    const templateRows = Array.from({ length: 30 }, (_, i) => {
      const d = i + 1;
      const dateStr = `${d}/11/2026`;
      const dateObj = new Date(2026, 10, d);
      const dayName = dayNamesGu[dateObj.getDay()];
      const communalSquad = `PI શ્રી, સ્કોડ-${((d - 1) % 10 + 1).toString().padStart(2, '0')}`;
      const divisionSquad = `PI શ્રી, સ્કોડ-${((d + 6) % 10 + 1).toString().padStart(2, '0')}`;
      const cmSquad = `સ્કોડ-${((d + 7) % 10 + 1).toString().padStart(2, '0')}`;
      const campusSquad = `સ્કોડ-${((d - 1) % 10 + 1).toString().padStart(2, '0')}`;

      return [
        `"${dateStr}"`,
        `"${dayName}"`,
        `"${formatDutyForExport(communalSquad, officersMap, officers).replace(/"/g, '""')}"`,
        `"${formatDutyForExport(divisionSquad, officersMap, officers).replace(/"/g, '""')}"`,
        `"${formatDutyForExport(cmSquad, officersMap, officers).replace(/"/g, '""')}"`,
        `"${formatDutyForExport(campusSquad, officersMap, officers).replace(/"/g, '""')}"`
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...templateRows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Crime_Branch_1_to_30_Duty_Template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('૧ થી ૩૦ સેમ્પલ ટેમ્પલેટ (CSV) ડાઉનલોડ થઈ ગયું!');
  };

  const renderOverviewCell = (squadOrName: string, dutyKey: string, dutyTitle: string, row: DutyRow) => {
    const resolved = resolveOfficerAndSquad(squadOrName, officersMap, officers);
    const displayName = resolved.name || squadOrName;
    const squadBadge = resolved.squadFormatted || formatSquadText(squadOrName) || squadOrName;

    return (
      <div 
        onClick={() => setSwapModal({ isOpen: true, date: row.date, dutyColumnId: dutyKey, currentSquad: (row as any)[dutyKey] })}
        className="group relative p-2.5 bg-slate-950/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all cursor-pointer shadow-xs min-w-[155px]"
        title={lang === 'gu' ? `સ્વેપ કરવા ક્લિક કરો (${row.date} - ${dutyTitle})` : `Click to swap`}
      >
        <div className="flex flex-col pr-8 min-h-[46px] justify-center">
          <span className="text-sm font-black text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-1">
            {displayName}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/30">
              {squadBadge}
            </span>
            {resolved.rank && (
              <span className="text-[9px] text-slate-400 font-bold bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/40">
                {resolved.rank}
              </span>
            )}
            {dutyKey === 'divisionPi' && row.divisionArea && (
              <span className="text-[9px] text-indigo-300 font-bold bg-indigo-950/80 px-1 py-0.5 rounded border border-indigo-700/40">
                {row.divisionArea}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenIndividualWhatsApp(squadOrName, dutyKey, dutyTitle, row.date, row.dayName);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800/80 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-slate-700/60 hover:border-emerald-500 transition-all cursor-pointer"
          title="WhatsApp"
        >
          <MessageSquare size={13} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold tracking-widest animate-pulse">CRIME BRANCH SYSTEM LOADING...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
        <Sidebar lang={lang} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentDate={currentDate}
            isNightShiftActive={isNightShiftActive}
            soundEnabled={alertConfig.soundEnabled}
            onToggleSound={() => setAlertConfig(c => ({ ...c, soundEnabled: !c.soundEnabled }))}
            onTestAlert={() => alertSound.playPoliceSiren()}
            onOpenAlertSettings={() => setIsAlertSettingsOpen(true)}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenRollCall={() => setIsRollCallOpen(true)}
            onPrint={() => window.print()}
            lang={lang}
            onToggleLang={() => setLang(l => l === 'gu' ? 'en' : 'gu')}
            onOpenBroadcastToday={() => handleOpenPiBroadcast(selectedDutyRow)}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="p-4 md:p-8 flex-1 overflow-y-auto no-print">
            <Routes>
              <Route path="/" element={
                <div className="space-y-8 animate-in fade-in duration-500">
                  {!supabase && (
                    <div className="bg-amber-900/20 border border-amber-800 text-amber-500 px-6 py-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                          <Bell size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {lang === 'gu' ? 'ડેટાબેઝ કનેક્ટ થયેલ નથી' : 'Database Not Connected'}
                          </p>
                          <p className="text-xs text-amber-500/70 mt-0.5">
                            {lang === 'gu' 
                              ? 'ફેરફારો સેવ કરવા માટે Supabase URL અને Key સેટ કરો. અત્યારે તમે લોકલ ડેટા જોઈ રહ્યા છો.' 
                              : 'Set Supabase URL and Key in .env to save changes permanently. Viewing local default data for now.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">
                        {dashboardView === 'table' 
                          ? (lang === 'gu' ? '૧ થી ૩૦ દિવસ ડ્યુટી પત્રક (Table View)' : '1 to 30 Duty Roster (Table View)') 
                          : (lang === 'gu' ? 'આજની રાત્રિ ફરજ' : 'Daily Duty Card')}
                      </h2>
                      <p className="text-slate-500 mt-1">
                        {dashboardView === 'table'
                          ? (lang === 'gu' ? 'સંપૂર્ણ મહિનાનું પોલીસ પેટ્રોલિંગ અને નાઈટ ડ્યુટી પત્રક' : 'Complete monthly night duty & security roster')
                          : (lang === 'gu' ? 'પોલીસ પેટ્રોલિંગ અને સુરક્ષા મોનિટરિંગ' : 'Police patrolling and security monitoring')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* View Switcher: Table View vs Card View */}
                      <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setDashboardView('table')}
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                            dashboardView === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                          title={lang === 'gu' ? 'ટેબલ વ્યૂ (૧ થી ૩૦ પત્રક)' : 'Table View'}
                        >
                          <TableIcon size={16} />
                          <span>{lang === 'gu' ? 'ટેબલ વ્યૂ' : 'Table View'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDashboardView('card')}
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                            dashboardView === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                          }`}
                          title={lang === 'gu' ? 'આજની ડ્યુટી કાર્ડ વ્યૂ' : 'Card View'}
                        >
                          <LayoutDashboard size={16} />
                          <span>{lang === 'gu' ? 'કાર્ડ વ્યૂ' : 'Card View'}</span>
                        </button>
                      </div>

                      <button onClick={() => handleExportCSV()} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2">
                        <Download size={16} />
                        {lang === 'gu' ? 'ડાઉનલોડ પત્રક' : 'Export'}
                      </button>
                    </div>
                  </div>

                  {dashboardView === 'table' ? (
                    <RosterTable
                      roster={roster}
                      officersMap={officersMap}
                      officers={officers}
                      currentDateStr={selectedDate}
                      onSendWhatsApp={handleOpenIndividualWhatsApp}
                      onPiBroadcast={handleOpenPiBroadcast}
                      onPsiBroadcast={handleOpenPsiBroadcast}
                      onSwapDuty={(date, id) => {
                        const row = roster.find(r => r.date === date);
                        setSwapModal({ isOpen: true, date, dutyColumnId: id, currentSquad: row ? (row as any)[id] : '' });
                      }}
                      onImportPaste={handleImportPaste}
                      onExportRoster={(data, type) => handleExportCSV(data, type)}
                      onDownloadTemplate={handleDownloadTemplate}
                      lang={lang}
                    />
                  ) : (
                    <>
                      {/* Quick 1 to 30 Date Selector for Rapid Swapping & Viewing */}
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold px-1">
                          <span className="text-slate-300 font-bold text-sm">
                            {lang === 'gu' ? 'તારીખ પસંદ કરો' : 'Select Date'}
                          </span>
                          <span className="text-amber-400 font-mono bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/40">
                            {lang === 'gu' ? 'પસંદ કરેલ તારીખ' : 'Active Date'}: {selectedDate}
                          </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {roster.map((r) => {
                            const isSelected = r.date === selectedDate;
                            const dayNum = r.date.split('/')[0];
                            return (
                              <button
                                key={r.date}
                                type="button"
                                onClick={() => setSelectedDate(r.date)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex flex-col items-center min-w-[56px] border ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-105 ring-2 ring-blue-500/30'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <span className="text-base font-black leading-none">{dayNum}</span>
                                <span className="text-[10px] font-bold opacity-80 mt-1">{r.dayName.slice(0, 3)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <TodayDutyCard
                        dutyRow={selectedDutyRow}
                        officersMap={officersMap}
                        officers={officers}
                        onSendWhatsApp={handleOpenIndividualWhatsApp}
                        onSwapDuty={(date, id) => setSwapModal({ isOpen: true, date, dutyColumnId: id, currentSquad: (selectedDutyRow as any)[id] })}
                        onUpdateDivisionArea={handleUpdateDivisionArea}
                        onBroadcast={(type, row) => type === 'PI' ? handleOpenPiBroadcast(row) : handleOpenPsiBroadcast(row, roster.indexOf(row))}
                        lang={lang}
                      />

                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Total PI Units', count: officers.filter(o => o.category === 'PI').length, color: 'blue' },
                          { label: 'Total PSI Units', count: officers.filter(o => o.category === 'PSI').length, color: 'emerald' },
                          { label: 'Roster Days', count: roster.length, color: 'amber' },
                          { label: 'Night Shifts', count: roster.length * 4, color: 'rose' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-black text-${stat.color}-500`}>{stat.count}</p>
                          </div>
                        ))}
                      </div>

                      {/* Roster Overview Table View */}
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/30">
                              <TableIcon className="text-white" size={24} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-white tracking-tight">
                                {lang === 'gu' ? 'રોસ્ટર ઓવરવ્યૂ (ટેબલ વ્યૂ)' : 'Roster Overview (Table View)'}
                              </h3>
                              <p className="text-slate-400 text-xs font-bold mt-0.5">
                                {lang === 'gu' ? '૧ થી ૩૦ તારીખનું તમામ નાઈટ ડ્યુટી પત્રક' : 'Complete monthly night duty & security roster'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleExportCSV()}
                              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                              <Download size={14} />
                              {lang === 'gu' ? 'CSV ડાઉનલોડ' : 'Download CSV'}
                            </button>
                            <Link
                              to="/roster"
                              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                            >
                              <TableIcon size={14} />
                              <span>{lang === 'gu' ? 'સંપૂર્ણ પત્રક ખોલો' : 'Open Full Table'}</span>
                            </Link>
                          </div>
                        </div>

                        {/* Roster Table Scrollable */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 max-h-[620px] overflow-y-auto scrollbar-thin">
                          <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md">
                              <tr className="border-b border-slate-800 text-center">
                                <th className="py-4 px-4 text-xs font-black text-slate-300 uppercase tracking-wider text-left w-36">
                                  {lang === 'gu' ? 'તારીખ અને વાર' : 'Date & Day'}
                                </th>
                                <th className="py-4 px-3 text-xs font-black text-blue-400 uppercase tracking-wider border-l border-slate-800/50">
                                  {lang === 'gu' ? 'કોમ્યુનલ (PI)' : 'Communal (PI)'}
                                </th>
                                <th className="py-4 px-3 text-xs font-black text-indigo-400 uppercase tracking-wider border-l border-slate-800/50">
                                  {lang === 'gu' ? 'ડીવીઝન (PI)' : 'Division (PI)'}
                                </th>
                                <th className="py-4 px-3 text-xs font-black text-amber-400 uppercase tracking-wider border-l border-slate-800/50">
                                  {lang === 'gu' ? 'CM મોરચો (PSI)' : 'CM Route (PSI)'}
                                </th>
                                <th className="py-4 px-3 text-xs font-black text-emerald-400 uppercase tracking-wider border-l border-slate-800/50">
                                  {lang === 'gu' ? 'કેમ્પસ (PSI)' : 'Campus (PSI)'}
                                </th>
                                <th className="py-4 px-3 text-center text-xs font-black text-slate-300 uppercase tracking-wider border-l border-slate-800/50 w-28">
                                  {lang === 'gu' ? 'પત્રક / SMS' : 'Broadcast'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-bold">
                              {roster.map((row) => {
                                const isCurrentDate = row.date === selectedDate;
                                return (
                                  <tr
                                    key={row.date}
                                    className={`transition-all hover:bg-slate-800/40 ${isCurrentDate ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''}`}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col">
                                        <span className="text-base font-black text-white leading-tight">{row.dayName}</span>
                                        <span className="text-xs font-mono font-black text-blue-400 tracking-wider">{row.date}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-2.5 border-l border-slate-800/30">
                                      {renderOverviewCell(row.communalPi, 'communalPi', 'કોમ્યુનલ નાઈટ', row)}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-l border-slate-800/30">
                                      {renderOverviewCell(row.divisionPi, 'divisionPi', 'ડીવીઝન નાઈટ', row)}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-l border-slate-800/30">
                                      {renderOverviewCell(row.cmMorchoPsi, 'cmMorchoPsi', 'CM મોરચો', row)}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-l border-slate-800/30">
                                      {renderOverviewCell(row.campusPsi, 'campusPsi', 'કેમ્પસ નાઈટ', row)}
                                    </td>
                                    <td className="py-2.5 px-2.5 text-center border-l border-slate-800/30">
                                      <div className="flex flex-col gap-1 items-center justify-center">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPiBroadcast(row)}
                                          className="w-full px-2 py-1 bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer border border-blue-500/20"
                                          title="PI Broadcast WhatsApp"
                                        >
                                          PI પત્રક
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPsiBroadcast(row, roster.indexOf(row))}
                                          className="w-full px-2 py-1 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-[10px] font-black transition-all cursor-pointer border border-emerald-500/20"
                                          title="PSI Broadcast WhatsApp"
                                        >
                                          PSI પત્રક
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Security Notice Banner */}
                      <div className="bg-gradient-to-r from-blue-900/50 via-slate-900 to-indigo-950/50 border border-blue-800/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                            <Shield size={24} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">Security & VHF Notice</h4>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                              All night shift officers must report to the control room via VHF within 15 minutes of shift start.
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsRollCallOpen(true)} 
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/30 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          Conduct Roll-Call
                        </button>
                      </div>
                    </>
                  )}
                </div>
              } />
              
              <Route path="/roster" element={
                <RosterTable
                  roster={roster}
                  officersMap={officersMap}
                  officers={officers}
                  currentDateStr={selectedDate}
                  onSendWhatsApp={handleOpenIndividualWhatsApp}
                  onPiBroadcast={handleOpenPiBroadcast}
                  onPsiBroadcast={handleOpenPsiBroadcast}
                  onSwapDuty={(date, id) => {
                    const row = roster.find(r => r.date === date);
                    setSwapModal({ isOpen: true, date, dutyColumnId: id, currentSquad: row ? (row as any)[id] : '' });
                  }}
                  onImportPaste={handleImportPaste}
                  onExportRoster={(data, type) => handleExportCSV(data, type)}
                  onDownloadTemplate={handleDownloadTemplate}
                  lang={lang}
                />
              } />

              <Route path="/list" element={<OfficerListView lang={lang} />} />
              <Route path="/officers" element={<OfficerDirectory lang={lang} />} />
              
              <Route path="/analytics" element={
                <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
                  <p>Detailed performance and duty distribution metrics are being calculated...</p>
                  <button onClick={() => setIsAnalyticsOpen(true)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold cursor-pointer">Open Analytics Modal</button>
                </div>
              } />
            </Routes>
          </main>

          <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-8 py-4 text-xs text-slate-500 flex items-center justify-between no-print">
            <p>© 2026 ક્રાઇમ બ્રાન્ચ - Night Duty Monitoring</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Live</span>
              <button onClick={() => setLang(l => l === 'gu' ? 'en' : 'gu')} className="hover:text-blue-500 transition-colors uppercase font-bold tracking-widest">{lang === 'gu' ? 'English' : 'ગુજરાતી'}</button>
            </div>
          </footer>
        </div>

        {/* Modals */}
        <WhatsAppModal isOpen={whatsAppModal.isOpen} onClose={() => setWhatsAppModal(m => ({ ...m, isOpen: false }))} title={whatsAppModal.title} recipientName={whatsAppModal.recipientName} recipientPhone={whatsAppModal.recipientPhone} initialMessage={whatsAppModal.message} lang={lang} />
        <DutySwapModal isOpen={swapModal.isOpen} onClose={() => setSwapModal(m => ({ ...m, isOpen: false }))} date={swapModal.date} dutyColumnId={swapModal.dutyColumnId} currentSquad={swapModal.currentSquad} onApplySwap={handleApplySwap} officers={officers} lang={lang} />
        <AlertSettingsModal isOpen={isAlertSettingsOpen} onClose={() => setIsAlertSettingsOpen(false)} config={alertConfig} onSaveConfig={setAlertConfig} onTriggerEmergencyRollCall={() => {}} lang={lang} />
        <DutyAnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} roster={roster} officersMap={officersMap} lang={lang} />
        <RollCallModal isOpen={isRollCallOpen} onClose={() => setIsRollCallOpen(false)} dutyRow={selectedDutyRow} officersMap={officersMap} onSaveAttendance={() => {}} lang={lang} />
        
        {toastMessage && (
          <div className="fixed bottom-10 right-10 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-blue-600/40 font-bold flex items-center gap-3 animate-in slide-in-from-bottom-10">
            <CheckCircle size={20} />
            {toastMessage}
          </div>
        )}
      </div>
      <PrintRosterView 
        roster={roster} 
        officersMap={officersMap} 
        officers={officers} 
        monthNameGu="નવેમ્બર" 
        year={2026} 
      />
    </BrowserRouter>
  );
}

