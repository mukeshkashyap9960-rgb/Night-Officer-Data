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
  Download
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
  createPsiBroadcastMessage 
} from './utils/whatsapp';
import { supabase, TABLES } from './utils/supabaseClient';

function Sidebar({ lang, isOpen, onClose }: { lang: 'gu' | 'en', isOpen: boolean, onClose: () => void }) {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: lang === 'gu' ? 'ડેશબોર્ડ' : 'Dashboard' },
    { path: '/roster', icon: TableIcon, label: lang === 'gu' ? 'ડ્યુટી પત્રક' : 'Full Roster' },
    { path: '/list', icon: Users, label: lang === 'gu' ? 'અધિકારી લિસ્ટ' : 'User List View' },
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
                <h1 className="text-white font-bold text-lg leading-tight">Gujarat Police</h1>
                <p className="text-slate-500 text-[11px] uppercase tracking-widest font-extrabold">Night Duty</p>
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
              <span className="text-sm text-slate-200 font-bold tracking-tight">Cloud Secure</span>
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
  const [roster, setRoster] = useState<DutyRow[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officersMap, setOfficersMap] = useState<Record<string, Officer>>({});
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
    alertTime: '18:00',
    reminderTemplateGu: '',
    autoAlertEnabled: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
  });

  const [whatsAppModal, setWhatsAppModal] = useState({ isOpen: false, title: '', recipientName: '', recipientPhone: '', message: '' });
  const [swapModal, setSwapModal] = useState({ isOpen: false, date: '', dutyColumnId: '', currentSquad: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);
  const [isRollCallOpen, setIsRollCallOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    initializeData();
    return () => clearInterval(timer);
  }, []);

  async function initializeData() {
    setLoading(true);
    
    if (!supabase) {
      // Supabase not configured, use local defaults
      setOfficers(DEFAULT_OFFICERS);
      const map: Record<string, Officer> = {};
      DEFAULT_OFFICERS.forEach(o => map[o.squad] = o);
      setOfficersMap(map);
      setRoster(NOVEMBER_2026_ROSTER);
      setLoading(false);
      return;
    }

    // Fetch Officers from Supabase
    const { data: officersData } = await supabase.from(TABLES.OFFICERS).select('*');
    if (officersData && officersData.length > 0) {
      setOfficers(officersData);
      const map: Record<string, Officer> = {};
      officersData.forEach(o => {
        if (o.squad) map[o.squad] = o;
        if (o.name) map[o.name] = o;
        if (o.id) map[o.id] = o;
      });
      setOfficersMap(map);
    } else {
      // Seed default if empty
      setOfficers(DEFAULT_OFFICERS);
      const map: Record<string, Officer> = {};
      DEFAULT_OFFICERS.forEach(o => {
        if (o.squad) map[o.squad] = o;
        if (o.name) map[o.name] = o;
        if (o.id) map[o.id] = o;
      });
      setOfficersMap(map);
    }

    // Fetch Roster from Supabase
    const { data: rosterData } = await supabase.from(TABLES.ROSTER).select('*').order('created_at', { ascending: true });
    if (rosterData && rosterData.length > 0) {
      const normalizedRoster: DutyRow[] = rosterData.map((r: any) => ({
        date: r.date,
        dayName: r.day_name || r.dayName || '',
        dayNameEn: r.day_name_en || r.dayNameEn || '',
        communalPi: r.communal_pi || r.communalPi || '',
        divisionPi: r.division_pi || r.divisionPi || '',
        cmMorchoPsi: r.cm_morcho_psi || r.cmMorchoPsi || '',
        campusPsi: r.campus_psi || r.campusPsi || '',
        vvipPsi: r.vvip_psi || r.vvipPsi || '',
      }));
      setRoster(normalizedRoster);
    } else {
      setRoster(NOVEMBER_2026_ROSTER);
    }

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
    const officer = officersMap[squad] || null;

    const message = createIndividualDutyMessage({ officer, squadText: squad, dutyTitleGu, date, dayName: day });
    setWhatsAppModal({ isOpen: true, title: `${dutyTitleGu} - WhatsApp`, recipientName: officer ? `${officer.name} (${squad})` : squad, recipientPhone: officer ? officer.phone : '', message });
  };

  const handleOpenPiBroadcast = (row: DutyRow) => {
    const message = createPiBroadcastMessage({ row, officersMap });
    setWhatsAppModal({ isOpen: true, title: `PI નાઈટ ડ્યુટી પત્રક`, recipientName: 'PI ગ્રૂપ', recipientPhone: '', message });
  };

  const handleOpenPsiBroadcast = (row: DutyRow, rowIndex: number) => {
    const nextRow = roster[rowIndex + 1];
    const message = createPsiBroadcastMessage({ row, nextRow, officersMap });
    setWhatsAppModal({ isOpen: true, title: `PSI નાઈટ ડ્યુટી પત્રક`, recipientName: 'PSI ગ્રૂપ', recipientPhone: '', message });
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

      if (cols.length >= 7) {
        newRows.push({
          date: cols[0],
          dayName: cols[1],
          dayNameEn: cols[1],
          communalPi: cols[2],
          divisionPi: cols[3],
          cmMorchoPsi: cols[4],
          campusPsi: cols[5],
          vvipPsi: cols[6],
        });
      }
    }

    if (newRows.length > 0) {
      const finalRoster = mode === 'replace' ? newRows : [...roster, ...newRows];
      setRoster(finalRoster);
      
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
        showToast(`Imported ${newRows.length} rows (${mode} mode - local only)`);
      }
    }
  };

  const handleApplySwap = async (date: string, dutyColumnId: string, newSquad: string) => {
    const updatedRoster = roster.map(row => row.date === date ? { ...row, [dutyColumnId]: newSquad } : row);
    setRoster(updatedRoster);

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

  const handleExportCSV = () => {
    const headers = ['તારીખ', 'વાર', 'કોમ્યુનલ નાઈટ (PI)', 'ડીવીઝન નાઈટ (PI)', 'CM મોરચો (PSI)', 'કેમ્પસ નાઈટ (PSI)', 'VVIP બંદોબસ્ત (PSI)'];
    const rows = roster.map(r => [`"${r.date}"`, `"${r.dayName}"`, `"${r.communalPi}"`, `"${r.divisionPi}"`, `"${r.cmMorchoPsi}"`, `"${r.campusPsi}"`, `"${r.vvipPsi}"`]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Night_Roster.csv`;
    link.click();
    showToast('CSV ફાઇલ ડાઉનલોડ થઈ ગઈ!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold tracking-widest animate-pulse">GUJARAT POLICE SYSTEM LOADING...</p>
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
                      <h2 className="text-3xl font-bold text-white tracking-tight">{lang === 'gu' ? 'આજની રાત્રિ ફરજ' : 'Dashboard'}</h2>
                      <p className="text-slate-500 mt-1">{lang === 'gu' ? 'પોલીસ પેટ્રોલિંગ અને સુરક્ષા મોનિટરિંગ' : 'Police patrolling and security monitoring'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleExportCSV} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl border border-slate-800 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2">
                        <Download size={16} />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Quick 1 to 30 Date Selector for Rapid Swapping & Viewing */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold px-1">
                      <span className="text-slate-400">
                        {lang === 'gu' ? '૧ થી ૩૦ તારીખ પસંદ કરો (ફટાફટ સ્વેપ અને વિગત માટે):' : 'Select Date (1 to 30 November):'}
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
                    onBroadcast={(type, row) => type === 'PI' ? handleOpenPiBroadcast(row) : handleOpenPsiBroadcast(row, roster.indexOf(row))}
                    lang={lang}
                  />

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total PI Units', count: officers.filter(o => o.category === 'PI').length, color: 'blue' },
                      { label: 'Total PSI Units', count: officers.filter(o => o.category === 'PSI').length, color: 'emerald' },
                      { label: 'Roster Days', count: roster.length, color: 'amber' },
                      { label: 'Night Shifts', count: roster.length * 5, color: 'rose' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black text-${stat.color}-500`}>{stat.count}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white">Roster Overview</h3>
                        <Link to="/roster" className="text-blue-500 text-sm font-bold hover:underline">View All</Link>
                      </div>
                      <div className="space-y-4">
                        {roster.slice(0, 5).map(row => (
                          <div key={row.date} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-800">{row.date.split('/')[0]}</div>
                              <div>
                                <p className="text-sm font-bold text-white">{row.dayName}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{row.date}</p>
                              </div>
                            </div>
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold" title="PI">PI</div>
                              <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold" title="PSI">PS</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                       <Shield className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-12" />
                       <h3 className="text-xl font-bold mb-2">Security Notice</h3>
                       <p className="text-blue-100 text-sm leading-relaxed mb-6">All night shift officers must report to the control room via VHF within 15 minutes of shift start.</p>
                       <button onClick={() => setIsRollCallOpen(true)} className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/20 hover:scale-[1.02] transition-all cursor-pointer">
                         Conduct Roll-Call
                       </button>
                    </div>
                  </div>
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
            <p>© 2026 Gujarat Police - Night Duty Monitoring</p>
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
      <PrintRosterView roster={roster} monthNameGu="નવેમ્બર" year={2026} />
    </BrowserRouter>
  );
}

