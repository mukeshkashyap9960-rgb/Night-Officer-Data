import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  Phone, 
  Filter, 
  X, 
  Save, 
  ClipboardPaste, 
  Check,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Officer } from '../types/roster';
import { DEFAULT_OFFICERS } from '../data/rosterData';
import { supabase, TABLES } from '../utils/supabaseClient';
import { 
  fetchAndSyncOfficers, 
  persistOfficers, 
  removeOfficer, 
  upsertOfficer,
  loadOfficersFromLocal
} from '../utils/storage';

interface OfficerDirectoryProps {
  lang: 'gu' | 'en';
}

export const OfficerDirectory: React.FC<OfficerDirectoryProps> = ({ lang }) => {
  const [officers, setOfficers] = useState<Officer[]>(() => loadOfficersFromLocal() || DEFAULT_OFFICERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PI' | 'PSI'>('ALL');
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isAddModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');

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

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
    link.download = `Gujarat_Police_Officers_Export_${dateStr}.csv`;
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

  async function handleDeleteOfficer(id: string) {
    if (!window.confirm(lang === 'gu' ? 'શું તમે આ અધિકારીને ડિલીટ કરવા માંગો છો?' : 'Delete this officer?')) return;
    const updated = await removeOfficer(id);
    setOfficers(updated);
  }

  async function handleProcessImport(mode: 'append' | 'replace') {
    if (!pastedData.trim()) return;

    const lines = pastedData.trim().split('\n');
    const newOfficers: Partial<Officer>[] = [];
    const headerKeywords = ['અ.નં.', 'હોદ્દો', 'નામ', 'મોબાઇલ', 'sr', 'rank', 'squad', 'place', 'ફરજની', 'designation', 'બ.નં.'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try different delimiters: Tab, Comma, or 2+ Spaces
      let cols = line.split('\t');
      if (cols.length < 3) cols = line.split(',');
      if (cols.length < 3) cols = line.split(/\s{2,}/);
      
      cols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

      // Skip header if it looks like one
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

        // 1. Identify Rank & Category
        // Priority to exact matches or common abbreviations
        const rankIdx = cols.findIndex(c => /^(PI|PSI|WPI|WPSI)$/i.test(c) || /(પોલીસ ઇન્સ્પેક્ટર|પોલીસ સબ ઇન્સ્પેક્ટર)/.test(c));
        if (rankIdx !== -1) {
          rankStr = cols[rankIdx];
          const upper = rankStr.toUpperCase();
          category = (upper.includes('PI') && !upper.includes('PSI')) ? 'PI' : 'PSI';
        } else {
          // Fallback search for rank anywhere
          const fallbackRankIdx = cols.findIndex(c => /PI|PSI|WPI|WPSI/i.test(c));
          if (fallbackRankIdx !== -1) {
             rankStr = cols[fallbackRankIdx];
             const upper = rankStr.toUpperCase();
             category = (upper.includes('PI') && !upper.includes('PSI')) ? 'PI' : 'PSI';
          }
        }

        // 2. Identify Phone
        const phoneIdx = cols.findIndex(c => {
          const digitsOnly = c.replace(/\D/g, '');
          return digitsOnly.length >= 10 && !c.includes('સ્કોડ') && !c.includes('Squad');
        });
        if (phoneIdx !== -1) {
          phoneStr = cols[phoneIdx].replace(/[^\d]/g, '');
        }

        // 3. Identify Name
        const nameIdx = cols.findIndex(c => c.includes('શ્રી') || c.startsWith('Mr.') || c.startsWith('Ms.'));
        if (nameIdx !== -1) {
          nameStr = cols[nameIdx];
        }

        // 4. Identify Squad
        const squadIdx = cols.findIndex(c => c.includes('સ્કોડ') || c.includes('Squad') || c.includes('ફરજની') || c.includes('જગ્યા'));
        if (squadIdx !== -1) {
          squadStr = cols[squadIdx];
        }

        // 5. Fallback heuristics for missing columns
        const usedIndices = new Set([rankIdx, phoneIdx, nameIdx, squadIdx].filter(idx => idx !== -1));
        
        // If name still missing, look for longest unused string that isn't a number
        if (!nameStr) {
          const candidates = cols.map((c, idx) => ({ c, idx }))
            .filter(({ c, idx }) => !usedIndices.has(idx) && idx !== 0 && c.length > 3 && !/^\d+$/.test(c.replace(/\D/g, '')));
          if (candidates.length > 0) {
            const best = candidates.sort((a, b) => b.c.length - a.c.length)[0];
            nameStr = best.c;
            usedIndices.add(best.idx);
          }
        }

        // If squad still missing, look for remaining strings
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
      o.rank.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'ALL' || o.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">

      <div className="flex flex-col xl:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
            <Shield className="text-blue-500 w-10 h-10" />
            {lang === 'gu' ? 'અધિકારી ડાયરેક્ટરી' : 'Officer Directory'}
          </h2>
          <div className="flex items-center gap-6 mt-2 text-slate-500">
            <p className="text-base font-bold uppercase tracking-widest">{lang === 'gu' ? 'કુલ અધિકારીઓ' : 'Total Officers'}: <span className="text-blue-500">{officers.length}</span></p>
            <div className="h-4 w-px bg-slate-800"></div>
            <p className="text-base font-bold uppercase tracking-widest">PI: <span className="text-blue-400">{officers.filter(o => o.category === 'PI').length}</span></p>
            <p className="text-base font-bold uppercase tracking-widest">PSI: <span className="text-emerald-400">{officers.filter(o => o.category === 'PSI').length}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 transition-all cursor-pointer shadow-xl shadow-emerald-900/20 active:scale-95"
            title={lang === 'gu' ? 'Excel / CSV શીટ એક્સપોર્ટ કરો' : 'Export to Excel'}
          >
            <FileSpreadsheet size={20} />
            {lang === 'gu' ? 'Excel એક્સપોર્ટ' : 'EXPORT EXCEL'}
          </button>
          <button 
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 transition-all cursor-pointer border border-slate-700"
          >
            <ClipboardPaste size={20} />
            PASTE IMPORT
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingOfficer({ id: 'new-' + Date.now(), squad: '', category: 'PI', name: '', rank: '', phone: '', branch: '' });
              setIsAddOfficerModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all cursor-pointer shadow-xl shadow-blue-900/20"
          >
            <Plus size={24} />
            {lang === 'gu' ? 'નવા ઉમેરો' : 'ADD NEW'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          <input
            type="text"
            placeholder={lang === 'gu' ? 'નામ, સ્કોડ અથવા હોદ્દો શોધો...' : 'Search officers...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-lg font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1.5">
          {(['ALL', 'PI', 'PSI'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest transition-all cursor-pointer uppercase ${
                categoryFilter === cat ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? (lang === 'gu' ? 'બધા' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="px-10 py-7 text-sm font-black text-slate-400 uppercase tracking-widest">{lang === 'gu' ? 'કેટેગરી' : 'Category'}</th>
              <th className="px-6 py-7 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">{lang === 'gu' ? 'સ્કોડ' : 'Squad'}</th>
              <th className="px-6 py-7 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">{lang === 'gu' ? 'નામ' : 'Full Name'}</th>
              <th className="px-6 py-7 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">{lang === 'gu' ? 'હોદ્દો' : 'Rank'}</th>
              <th className="px-6 py-7 text-sm font-black text-slate-400 uppercase tracking-widest border-l border-slate-800/50">{lang === 'gu' ? 'મોબાઇલ' : 'Mobile'}</th>
              <th className="px-10 py-7 text-sm font-black text-slate-400 uppercase tracking-widest text-right border-l border-slate-800/50">{lang === 'gu' ? 'ક્રિયાઓ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-bold">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Loading Secure Data...</p>
                  </div>
                </td>
              </tr>
            ) : filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-500 text-xl font-bold">
                  {lang === 'gu' ? 'કોઈ રેકોર્ડ મળ્યો નથી' : 'No records found in database'}
                </td>
              </tr>
            ) : (
              filteredOfficers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-10 py-6">
                    <span className={`text-[11px] font-black px-4 py-1.5 rounded-xl uppercase border tracking-widest ${
                      o.category === 'PI' ? 'bg-blue-900/30 text-blue-300 border-blue-800' : 'bg-emerald-900/30 text-emerald-300 border-emerald-800'
                    }`}>
                      {o.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-xl text-slate-300 font-mono border-l border-slate-800/20">{o.squad}</td>
                  <td className="px-6 py-6 text-2xl font-black text-white border-l border-slate-800/20 tracking-tight">{o.name}</td>
                  <td className="px-6 py-6 text-lg text-slate-400 border-l border-slate-800/20">{o.rank}</td>
                  <td className="px-6 py-6 text-xl text-blue-400 font-mono border-l border-slate-800/20 tracking-wider">{o.phone}</td>
                  <td className="px-10 py-6 text-right space-x-3 border-l border-slate-800/20">
                    <button
                      onClick={() => {
                        setEditingOfficer(o);
                        setIsAddOfficerModalOpen(true);
                      }}
                      className="p-3 text-slate-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all cursor-pointer inline-flex shadow-lg"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(o.id)}
                      className="p-3 text-slate-400 hover:text-white hover:bg-rose-600 rounded-2xl transition-all cursor-pointer inline-flex shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Paste Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Import Officers</h3>
                <p className="text-slate-500 text-base font-bold mt-1 uppercase tracking-widest">Excel / Google Sheets Copy-Paste</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-3 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 rounded-2xl">
                <X size={28} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl text-blue-300 text-sm font-bold leading-relaxed">
                ℹ️ Format: Category (PI/PSI), Squad, Name, Rank, Phone, Branch. Copy rows from Excel and paste below.
              </div>
              <textarea
                className="w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-[2rem] p-8 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-base leading-relaxed"
                placeholder="Paste officer rows here..."
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
                    APPEND LIST
                  </button>
                  <button
                    onClick={() => handleProcessImport('replace')}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/30 cursor-pointer active:scale-95"
                  >
                    <Check size={24} />
                    REPLACE LIST
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isAddModalOpen && editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-2xl font-black text-white">
                {editingOfficer.id?.toString().startsWith('new-') ? 'Add Officer' : 'Edit Officer'}
              </h3>
              <button onClick={() => setIsAddOfficerModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 p-2 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveOfficer} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Category</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={editingOfficer.category}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, category: e.target.value as 'PI' | 'PSI' })}
                  >
                    <option value="PI">PI</option>
                    <option value="PSI">PSI</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Squad</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    placeholder="સ્કોડ-૦૧"
                    value={editingOfficer.squad}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, squad: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-lg tracking-tight"
                  placeholder="અધિકારીનું નામ"
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Designation</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="પોલીસ અધિકારી"
                  value={editingOfficer.rank}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, rank: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  placeholder="98XXXXXXXX"
                  value={editingOfficer.phone}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, phone: e.target.value })}
                />
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white font-bold transition-all cursor-pointer uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
