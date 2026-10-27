import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  Phone, 
  Filter, 
  User, 
  BadgeCheck, 
  MapPin, 
  X, 
  MessageSquare, 
  Users,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Plus,
  ClipboardPaste,
  Edit2,
  Trash2,
  Save,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Officer } from '../types/roster';
import { DEFAULT_OFFICERS } from '../data/rosterData';
import { formatSquadText } from '../utils/whatsapp';
import { supabase, TABLES } from '../utils/supabaseClient';
import { 
  fetchAndSyncOfficers, 
  persistOfficers, 
  removeOfficer, 
  upsertOfficer,
  loadOfficersFromLocal,
  saveOfficersToLocal
} from '../utils/storage';

interface OfficerListViewProps {
  lang: 'gu' | 'en';
}

export const OfficerListView: React.FC<OfficerListViewProps> = ({ lang }) => {
  const [officers, setOfficers] = useState<Officer[]>(() => loadOfficersFromLocal() || DEFAULT_OFFICERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PI' | 'PSI'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchOfficers();

    const handleOfficersUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setOfficers(e.detail);
      }
    };

    window.addEventListener('officers_updated', handleOfficersUpdated);
    return () => window.removeEventListener('officers_updated', handleOfficersUpdated);
  }, []);

  async function fetchOfficers() {
    setLoading(true);
    const data = await fetchAndSyncOfficers();
    setOfficers(data);
    setLoading(false);
  }

  const handleExportExcel = () => {
    const listToExport = filteredOfficers.length > 0 ? filteredOfficers : officers;
    if (listToExport.length === 0) {
      alert(lang === 'gu' ? 'એક્સપોર્ટ કરવા માટે કોઈ ડેટા નથી.' : 'No data to export.');
      return;
    }

    const headers = [
      'અ.નં.',
      'કેટેગરી (Category)',
      'હોદ્દો (Rank)',
      'નામ (Officer Name)',
      'ફરજની જગ્યા / સ્કોડ (Squad)',
      'મોબાઇલ નંબર (Mobile Number)',
      'બ્રાન્ચ (Branch)'
    ];

    const rows = listToExport.map((o, idx) => [
      idx + 1,
      `"${o.category || ''}"`,
      `"${(o.rank || '').replace(/"/g, '""')}"`,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      `"${(o.squad || '').replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${(o.branch || '').replace(/"/g, '""')}"`
    ]);

    // Use UTF-8 BOM (\uFEFF) so Excel opens Gujarati text properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
    link.download = `Crime_Branch_Adhikari_Yadi_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  async function handleSaveOfficer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOfficer) return;

    const target: Officer = {
      ...editingOfficer,
      id: editingOfficer.id && !editingOfficer.id.toString().startsWith('new-') 
        ? editingOfficer.id 
        : 'off-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    };

    const updated = await upsertOfficer(target);
    setOfficers(updated);
    setEditingOfficer(null);
    setIsAddOfficerModalOpen(false);
  }

  function handleDeleteOfficer(officer: Officer) {
    setOfficerToDelete(officer);
  }

  async function confirmDeleteOfficer() {
    if (!officerToDelete) return;
    setIsDeleting(true);
    try {
      const removedOfficer = officerToDelete;
      const updated = await removeOfficer(removedOfficer);
      setOfficers(updated);
      setOfficerToDelete(null);
      setDeleteNotice(
        lang === 'gu'
          ? `શ્રી ${removedOfficer.name} (${formatSquadText(removedOfficer.squad) || removedOfficer.squad}) લિસ્ટમાંથી સફળતાપૂર્વક ડિલીટ થયા છે.`
          : `${removedOfficer.name} has been deleted successfully.`
      );
      setTimeout(() => setDeleteNotice(null), 4000);
    } catch (err) {
      console.error('Delete officer error', err);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleClearAllOfficers() {
    await persistOfficers([], 'replace');
    setOfficers([]);
  }

  async function handleProcessImport(mode: 'append' | 'replace') {
    if (!pastedData.trim()) return;

    const lines = pastedData.trim().split('\n');
    const newOfficers: Partial<Officer>[] = [];
    const headerKeywords = ['અ.નં.', 'હોદ્દો', 'નામ', 'મોબાઇલ', 'sr', 'rank', 'squad', 'place', 'ફરજની', 'designation', 'બ.નં.'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let cols = line.split('\t');
      if (cols.length < 3) cols = line.split(',');
      if (cols.length < 3) cols = line.split(/\s{2,}/);
      
      cols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

      if (i === 0) {
        const isHeader = cols.some(c => headerKeywords.some(k => c.toLowerCase().includes(k)));
        if (isHeader) continue;
      }

      if (cols.length >= 3) {
        let rankStr = '';
        let nameStr = '';
        let phoneStr = '';
        let squadStr = '';
        let category: 'PI' | 'PSI' = 'PSI';

        const rankIdx = cols.findIndex(c => /^(PI|PSI|WPI|WPSI)$/i.test(c) || /(પોલીસ ઇન્સ્પેક્ટર|પોલીસ સબ ઇન્સ્પેક્ટર)/.test(c));
        if (rankIdx !== -1) {
          rankStr = cols[rankIdx];
          const upper = rankStr.toUpperCase();
          category = (upper.includes('PI') && !upper.includes('PSI')) ? 'PI' : 'PSI';
        } else {
          const fallbackRankIdx = cols.findIndex(c => /PI|PSI|WPI|WPSI/i.test(c));
          if (fallbackRankIdx !== -1) {
             rankStr = cols[fallbackRankIdx];
             const upper = rankStr.toUpperCase();
             category = (upper.includes('PI') && !upper.includes('PSI')) ? 'PI' : 'PSI';
          }
        }

        const phoneIdx = cols.findIndex(c => {
          const digitsOnly = c.replace(/\D/g, '');
          return digitsOnly.length >= 10 && !c.includes('સ્કોડ') && !c.includes('Squad');
        });
        if (phoneIdx !== -1) {
          phoneStr = cols[phoneIdx].replace(/[^\d]/g, '');
        }

        const nameIdx = cols.findIndex(c => c.includes('શ્રી') || c.startsWith('Mr.') || c.startsWith('Ms.'));
        if (nameIdx !== -1) {
          nameStr = cols[nameIdx];
        }

        const squadIdx = cols.findIndex(c => c.includes('સ્કોડ') || c.includes('Squad') || c.includes('ફરજની') || c.includes('જગ્યા') || c.includes('સ્કોડ-'));
        if (squadIdx !== -1) {
          squadStr = cols[squadIdx];
        }

        const usedIndices = new Set([rankIdx, phoneIdx, nameIdx, squadIdx].filter(idx => idx !== -1));
        
        if (!nameStr) {
          const candidates = cols.map((c, idx) => ({ c, idx }))
            .filter(({ c, idx }) => !usedIndices.has(idx) && idx !== 0 && c.length > 3 && !/^\d+$/.test(c.replace(/\D/g, '')));
          if (candidates.length > 0) {
            const best = candidates.sort((a, b) => b.c.length - a.c.length)[0];
            nameStr = best.c;
            usedIndices.add(best.idx);
          }
        }

        if (!squadStr) {
          const candidates = cols.map((c, idx) => ({ c, idx }))
            .filter(({ c, idx }) => !usedIndices.has(idx) && idx !== 0 && c.length > 2);
          if (candidates.length > 0) {
            const best = candidates.sort((a, b) => b.c.length - a.c.length)[0];
            squadStr = best.c;
            usedIndices.add(best.idx);
          }
        }

        if (nameStr || squadStr) {
          newOfficers.push({
            category,
            squad: squadStr || 'સ્કોડ-૦૧',
            name: nameStr || 'અધિકારી',
            rank: rankStr || (category === 'PI' ? 'PI' : 'PSI'),
            phone: phoneStr,
            branch: ''
          });
        }
      }
    }

    if (newOfficers.length > 0) {
      const preparedOfficers: Officer[] = newOfficers.map((o, idx) => ({
        id: 'off-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
        category: o.category || 'PSI',
        squad: o.squad || 'સ્કોડ-૦૧',
        name: o.name || '',
        rank: o.rank || '',
        phone: o.phone || '',
        branch: o.branch || ''
      }));

      await persistOfficers(preparedOfficers, mode);
      const updated = loadOfficersFromLocal() || preparedOfficers;
      setOfficers(updated);
      setIsImportModalOpen(false);
      setPastedData('');
      alert(lang === 'gu' 
        ? `સફળતાપૂર્વક ${preparedOfficers.length} અધિકારીઓની યાદી સેવ થઈ ગઈ છે!` 
        : `Successfully saved ${preparedOfficers.length} officers!`);
    }
  }

  const filteredOfficers = officers.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm.trim() || 
      o.name.toLowerCase().includes(term) ||
      o.squad.toLowerCase().includes(term) ||
      o.phone.includes(searchTerm) ||
      (o.rank && o.rank.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === 'ALL' || o.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const piCount = officers.filter(o => o.category === 'PI').length;
  const psiCount = officers.filter(o => o.category === 'PSI').length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Notification Banner */}
      {deleteNotice && (
        <div className="bg-rose-950/70 border border-rose-500/40 text-rose-200 px-6 py-4 rounded-2xl flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 font-bold text-sm">
            <Check size={20} className="text-rose-400 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button 
            onClick={() => setDeleteNotice(null)}
            className="text-rose-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/30">
                <Users className="text-white w-8 h-8" />
             </div>
             <h2 className="text-4xl font-black text-white tracking-tight">
                {lang === 'gu' ? 'અધિકારી યાદી' : 'Personnel Registry'}
             </h2>
          </div>
          <p className="text-slate-500 text-lg font-bold ml-14">
            {lang === 'gu' ? 'તમામ સક્રિય પોલીસ અધિકારીઓની વિગતો' : 'Verified profiles of all active duty officers'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Total', count: officers.length, color: 'blue' },
              { label: 'PI Units', count: piCount, color: 'indigo' },
              { label: 'PSI Units', count: psiCount, color: 'emerald' },
            ].map((stat) => (
              <div key={stat.label} className={`bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center shadow-2xl flex flex-col items-center justify-center min-w-[90px]`}>
                 <p className={`text-[10px] font-black text-${stat.color}-500 uppercase tracking-widest mb-0.5`}>{stat.label}</p>
                 <p className="text-xl sm:text-2xl font-black text-white leading-none">{stat.count}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* PASTE IMPORT Button */}
            <button 
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-700 shadow-xl active:scale-95 shrink-0"
              title={lang === 'gu' ? 'Excel / Sheets માંથી ડેટા પેસ્ટ કરો' : 'Paste Import from Excel'}
            >
              <ClipboardPaste size={20} className="text-amber-400" />
              <div className="text-left">
                <div className="text-xs sm:text-sm font-black leading-tight uppercase tracking-tight">
                  PASTE IMPORT
                </div>
              </div>
            </button>

            {/* ADD NEW Button */}
            <button
              type="button"
              onClick={() => {
                setEditingOfficer({ id: 'new-' + Date.now(), squad: '', category: 'PI', name: '', rank: '', phone: '', branch: '' });
                setIsAddOfficerModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-blue-900/30 active:scale-95 shrink-0 border border-blue-500"
              title={lang === 'gu' ? 'નવા અધિકારી ઉમેરો' : 'Add New Officer'}
            >
              <Plus size={20} />
              <div className="text-left">
                <div className="text-xs sm:text-sm font-black leading-tight uppercase tracking-tight">
                  ADD NEW
                </div>
              </div>
            </button>

            {/* EXPORT EXCEL Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-900/30 cursor-pointer active:scale-95 shrink-0 border border-emerald-500/50"
              title={lang === 'gu' ? 'Excel / CSV શીટ એક્સપોર્ટ કરો' : 'Export Excel / CSV Sheet'}
            >
              <FileSpreadsheet size={20} className="shrink-0" />
              <div className="text-left">
                <div className="text-xs sm:text-sm font-black leading-tight">
                  {lang === 'gu' ? 'Excel એક્સપોર્ટ' : 'EXPORT EXCEL'}
                </div>
                <div className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">
                  {filteredOfficers.length} {lang === 'gu' ? 'અધિકારી' : 'Officers'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col xl:flex-row gap-6 items-center shadow-2xl relative z-10">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
          <input
            type="text"
            placeholder={lang === 'gu' ? 'નામ, સ્કોડ અથવા હોદ્દો શોધો...' : 'Search by name, squad, or designation...'}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl py-5 pl-16 pr-8 text-white text-xl font-bold focus:outline-none focus:ring-8 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-slate-950 border-2 border-slate-800 rounded-2xl p-1.5 shadow-inner flex-1 xl:flex-none">
            {(['ALL', 'PI', 'PSI'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-1 xl:px-10 py-3 rounded-xl text-base font-black uppercase tracking-widest transition-all cursor-pointer ${
                  categoryFilter === cat 
                    ? 'bg-blue-600 text-white shadow-xl scale-105' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? (lang === 'gu' ? 'બધા' : 'All') : cat}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-950 border-2 border-slate-800 rounded-2xl p-1.5 shadow-inner">
             <button 
               type="button"
               onClick={() => setViewMode('table')}
               className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                 viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white'
               }`}
               title={lang === 'gu' ? 'ટેબલ વ્યૂ' : 'Table View'}
             >
                <ListIcon size={16} />
                <span>{lang === 'gu' ? 'ટેબલ વ્યૂ' : 'Table View'}</span>
             </button>
             <button 
               type="button"
               onClick={() => setViewMode('grid')}
               className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                 viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white'
               }`}
               title={lang === 'gu' ? 'કાર્ડ વ્યૂ' : 'Card View'}
             >
                <LayoutGrid size={16} />
                <span>{lang === 'gu' ? 'કાર્ડ વ્યૂ' : 'Card View'}</span>
             </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-32 text-center space-y-6">
           <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-blue-900/20"></div>
           <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-sm">Synchronizing Database...</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/90 text-xs sm:text-sm font-black text-slate-300 uppercase tracking-wider">
                <th className="px-6 py-6 text-center w-16">{lang === 'gu' ? 'અ.નં.' : 'Sr.'}</th>
                <th className="px-6 py-6 border-l border-slate-800/60 w-32">{lang === 'gu' ? 'કેટેગરી' : 'Category'}</th>
                <th className="px-6 py-6 border-l border-slate-800/60 w-36">{lang === 'gu' ? 'હોદ્દો' : 'Rank'}</th>
                <th className="px-6 py-6 border-l border-slate-800/60">{lang === 'gu' ? 'અધિકારી શ્રી નું નામ' : 'Officer Name'}</th>
                <th className="px-6 py-6 border-l border-slate-800/60">{lang === 'gu' ? 'સ્કોડ / શાખા' : 'Squad / Branch'}</th>
                <th className="px-6 py-6 border-l border-slate-800/60">{lang === 'gu' ? 'મોબાઇલ નંબર' : 'Mobile Number'}</th>
                <th className="px-6 py-6 text-center border-l border-slate-800/60 w-52">{lang === 'gu' ? 'ક્રિયાઓ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-bold">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center text-slate-500">
                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-bold">{lang === 'gu' ? 'કોઈ અધિકારી મળ્યા નથી' : 'No officers found'}</p>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((o, idx) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-sm">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800/40">
                      <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase border tracking-wider ${
                        o.category === 'PI' 
                          ? 'bg-blue-950/60 text-blue-400 border-blue-800' 
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      }`}>
                        {o.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800/40 text-slate-300 font-semibold">
                      {o.rank || (o.category === 'PI' ? 'PI' : 'PSI')}
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          o.category === 'PI' ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'
                        }`}>
                          <User size={16} />
                        </div>
                        <span className="text-white text-base font-black group-hover:text-blue-400 transition-colors">
                          {o.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800/40">
                      <span className="text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-amber-800/30">
                        {formatSquadText(o.squad) || o.squad}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800/40">
                      {o.phone ? (
                        <a 
                          href={`tel:${o.phone}`}
                          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-sm transition-colors"
                        >
                          <Phone size={14} />
                          <span>{o.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center border-l border-slate-800/40">
                      <div className="flex items-center justify-center gap-2">
                        {o.phone && (
                          <button
                            type="button"
                            onClick={() => window.open(`https://wa.me/91${o.phone.replace(/\D/g, '')}`, '_blank')}
                            className="p-2 text-emerald-400 hover:text-white bg-slate-950 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-emerald-500 shadow-sm"
                            title="WhatsApp"
                          >
                            <MessageSquare size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOfficer(o);
                            setIsAddOfficerModalOpen(true);
                          }}
                          className="p-2 text-blue-400 hover:text-white bg-slate-950 hover:bg-blue-600 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-blue-500 shadow-sm"
                          title={lang === 'gu' ? 'એડિટ કરો' : 'Edit'}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOfficer(o)}
                          className="p-2 text-rose-400 hover:text-white bg-slate-950 hover:bg-rose-600 rounded-xl transition-all cursor-pointer border border-rose-950/60 hover:border-rose-500 shadow-sm"
                          title={lang === 'gu' ? 'ડિલીટ કરો' : 'Delete'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredOfficers.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-slate-900/30 rounded-[4rem] border-4 border-dashed border-slate-800/50">
               <Users size={80} className="mx-auto text-slate-800 mb-6 opacity-20" />
               <p className="text-3xl font-black text-slate-600 mb-2">{lang === 'gu' ? 'કોઈ સભ્ય મળ્યા નથી' : 'Registry Entry Not Found'}</p>
               <p className="text-slate-700 font-bold">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredOfficers.map((o) => (
              <div 
                key={o.id}
                className="bg-slate-900 border border-slate-800/80 transition-all group shadow-2xl relative overflow-hidden flex flex-col p-10 rounded-[3rem] gap-8 hover:border-blue-500/40 hover:shadow-blue-900/10"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-5 transition-transform group-hover:scale-125 group-hover:rotate-12 pointer-events-none ${o.category === 'PI' ? 'text-blue-500' : 'text-emerald-500'}`}>
                   <Shield className="w-full h-full" />
                </div>

                <div className="flex items-center gap-6">
                  <div className={`rounded-3xl flex items-center justify-center shadow-2xl shrink-0 w-20 h-20 ${
                    o.category === 'PI' 
                      ? 'bg-blue-600/20 text-blue-500 border border-blue-500/20' 
                      : 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    <User size={40} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-[0.1em] border ${
                        o.category === 'PI' ? 'bg-blue-950/50 text-blue-400 border-blue-800' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                      }`}>
                        {o.category}
                      </span>
                      <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest">{formatSquadText(o.squad) || o.squad}</span>
                    </div>
                    <h4 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight">
                      {o.name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-5 p-5 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                    <BadgeCheck className="text-blue-500 shrink-0" size={24} />
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Designation</p>
                      <p className="text-xl font-bold text-slate-200">{o.rank || 'General Officer'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 p-5 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                    <Phone className="text-emerald-500 shrink-0" size={24} />
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Contact Line</p>
                      <a href={`tel:${o.phone}`} className="text-2xl font-mono font-black text-emerald-500 hover:text-emerald-400 transition-colors">
                        {o.phone || '982XXXXXXX'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  <button 
                    onClick={() => window.open(`https://wa.me/91${o.phone}`, '_blank')}
                    className="bg-slate-950 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-slate-800 hover:border-emerald-500 cursor-pointer shadow-inner active:scale-[0.95] flex-1 py-3.5 text-sm"
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingOfficer(o);
                      setIsAddOfficerModalOpen(true);
                    }}
                    className="p-3 text-slate-400 hover:text-white bg-slate-950 hover:bg-blue-600 rounded-2xl transition-all cursor-pointer border border-slate-800 hover:border-blue-500 shadow-sm"
                    title={lang === 'gu' ? 'એડિટ કરો' : 'Edit Officer'}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteOfficer(o)}
                    className="p-3 text-rose-400 hover:text-white bg-slate-950 hover:bg-rose-600 rounded-2xl transition-all cursor-pointer border border-rose-950/60 hover:border-rose-500 shadow-sm"
                    title={lang === 'gu' ? 'અધિકારી ડિલીટ કરો' : 'Delete Officer'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Spreadsheet Paste Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {lang === 'gu' ? 'Excel માંથી અધિકારીઓ ઇમ્પોર્ટ કરો' : 'Import Officers from Spreadsheet'}
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                  Excel / Google Sheets Copy-Paste
                </p>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)} 
                className="p-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 rounded-2xl"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-blue-950/50 border border-blue-800/60 p-4 rounded-2xl text-blue-300 text-xs font-bold leading-relaxed">
                ℹ️ {lang === 'gu' ? 'Excel માંથી રો સિલેક્ટ કરીને Copy કરો અને નીચે Paste કરો. (દા.ત. અ.નં., હોદ્દો, બ.નં., નામ, મોબાઇલ, ફરજની જગ્યા/સ્કોડ)' : 'Copy rows from Excel and paste below. (e.g. SrNo, Rank, Name, Mobile, Squad)'}
              </div>
              <textarea
                className="w-full h-72 bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-white focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
                placeholder={lang === 'gu' ? 'Excel માંથી કોપી કરેલી વિગત અહીં પેસ્ટ કરો...' : 'Paste Excel rows here...'}
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleProcessImport('append')}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer shadow-lg active:scale-95 text-xs uppercase tracking-wider"
                  >
                    {lang === 'gu' ? 'લિસ્ટમાં ઉમેરો (APPEND)' : 'APPEND LIST'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcessImport('replace')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 cursor-pointer active:scale-95 text-xs uppercase tracking-wider"
                  >
                    <Check size={18} />
                    {lang === 'gu' ? 'બધું બદલો (REPLACE ALL)' : 'REPLACE ALL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Officer Modal */}
      {isAddOfficerModalOpen && editingOfficer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {editingOfficer.id?.toString().startsWith('new-') 
                  ? (lang === 'gu' ? 'નવા અધિકારી ઉમેરો' : 'Add New Officer') 
                  : (lang === 'gu' ? 'અધિકારી વિગત સુધારો' : 'Edit Officer')}
              </h3>
              <button 
                onClick={() => setIsAddOfficerModalOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 p-2 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveOfficer} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'gu' ? 'કેટેગરી (Category)' : 'Category'}
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    value={editingOfficer.category}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, category: e.target.value as 'PI' | 'PSI' })}
                  >
                    <option value="PI">PI</option>
                    <option value="PSI">PSI</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'gu' ? 'સ્કોડ / ફરજની જગ્યા' : 'Squad'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    placeholder="દા.ત. સ્કોડ-૦૨"
                    value={editingOfficer.squad}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, squad: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {lang === 'gu' ? 'અધિકારીનું પૂરું નામ' : 'Officer Full Name'}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-base"
                  placeholder="દા.ત. શ્રી વી. બી. આલ"
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'gu' ? 'હોદ્દો (Rank)' : 'Designation / Rank'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    placeholder="દા.ત. PI / PSI / WPI"
                    value={editingOfficer.rank}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, rank: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {lang === 'gu' ? 'મોબાઇલ નંબર' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm"
                    placeholder="89800 37926"
                    value={editingOfficer.phone}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {lang === 'gu' ? 'બ્રાન્ચ / અન્ય વિગત (વૈકલ્પિક)' : 'Branch / Additional Note'}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  placeholder="દા.ત. ક્રાઈમ બ્રાન્ચ / સાયબર"
                  value={editingOfficer.branch || ''}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, branch: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/30 active:scale-95 text-xs uppercase tracking-wider"
                >
                  <Save size={16} />
                  {lang === 'gu' ? 'સેવ કરો' : 'Save Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {officerToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-950/50">
                <Trash2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">
                  {lang === 'gu' ? 'અધિકારી ડિલીટ કરવાની ખાતરી' : 'Confirm Officer Deletion'}
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  {lang === 'gu'
                    ? 'શું તમે ખરેખર આ અધિકારીની વિગતો લિસ્ટમાંથી ડિલીટ કરવા માંગો છો?'
                    : 'Are you sure you want to permanently delete this officer from the list?'}
                </p>
              </div>

              {/* Officer Details Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-black px-3 py-0.5 rounded-full uppercase border ${
                    officerToDelete.category === 'PI' 
                      ? 'bg-blue-950/60 text-blue-400 border-blue-800' 
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  }`}>
                    {officerToDelete.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {formatSquadText(officerToDelete.squad) || officerToDelete.squad}
                  </span>
                </div>
                <div className="text-lg font-black text-white">
                  {officerToDelete.name}
                </div>
                <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                  <span>{officerToDelete.rank || 'પોલીસ અધિકારી'}</span>
                  {officerToDelete.phone && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{officerToDelete.phone}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfficerToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {lang === 'gu' ? 'રદ કરો (Cancel)' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteOfficer}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black transition-all cursor-pointer shadow-lg shadow-rose-900/40 active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>{lang === 'gu' ? 'હા, ડિલીટ કરો' : 'Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
