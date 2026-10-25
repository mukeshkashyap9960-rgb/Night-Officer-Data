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
  Check 
} from 'lucide-react';
import { Officer } from '../types/roster';
import { supabase, TABLES } from '../utils/supabaseClient';

interface OfficerDirectoryProps {
  lang: 'gu' | 'en';
}

export const OfficerDirectory: React.FC<OfficerDirectoryProps> = ({ lang }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PI' | 'PSI'>('ALL');
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isAddModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');

  useEffect(() => {
    if (supabase) {
      fetchOfficers();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchOfficers() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLES.OFFICERS)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOfficers(data);
    }
    setLoading(false);
  }

  async function handleSaveOfficer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOfficer || !supabase) return;

    const { id, ...officerData } = editingOfficer;
    let result;

    if (id && !id.toString().startsWith('new-')) {
      result = await supabase
        .from(TABLES.OFFICERS)
        .update(officerData)
        .eq('id', id);
    } else {
      result = await supabase
        .from(TABLES.OFFICERS)
        .insert([officerData]);
    }

    if (!result.error) {
      setEditingOfficer(null);
      setIsAddOfficerModalOpen(false);
      fetchOfficers();
    }
  }

  async function handleDeleteOfficer(id: string) {
    if (!window.confirm(lang === 'gu' ? 'શું તમે આ અધિકારીને ડિલીટ કરવા માંગો છો?' : 'Delete this officer?')) return;
    if (!supabase) return;

    const { error } = await supabase
      .from(TABLES.OFFICERS)
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Error deleting officer: ${error.message} (Code: ${error.code})`);
    } else {
      fetchOfficers();
    }
  }

  async function handleProcessImport(mode: 'append' | 'replace') {
    if (!pastedData.trim() || !supabase) return;

    const lines = pastedData.trim().split('\n');
    const newOfficers: Partial<Officer>[] = [];

    for (const line of lines) {
      const cols = line.split(/\t|,/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 4) {
        newOfficers.push({
          category: (cols[0].toUpperCase().includes('PI') && !cols[0].toUpperCase().includes('PSI')) ? 'PI' : 'PSI',
          squad: cols[1],
          name: cols[2],
          rank: cols[3],
          phone: cols[4] || '',
          branch: cols[5] || ''
        });
      }
    }

    if (newOfficers.length > 0) {
      try {
        if (mode === 'replace') {
          const { error: delError } = await supabase.from(TABLES.OFFICERS).delete().neq('name', 'DELETE_ALL_HACK');
          if (delError) throw delError;
        }

        const { error: insError } = await supabase.from(TABLES.OFFICERS).insert(newOfficers);
        if (insError) throw insError;

        setIsImportModalOpen(false);
        setPastedData('');
        fetchOfficers();
        alert('Import Successful!');
      } catch (err: any) {
        console.error('Import Error:', err);
        alert(`Server Error (401/Auth): ${err.message || 'Check your Supabase URL and API Key'}\n\nHint: Ensure you have run the SQL script in your Supabase dashboard.`);
      }
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
      {!supabase && (
        <div className="bg-amber-900/20 border border-amber-800 text-amber-500 px-6 py-4 rounded-2xl flex items-center gap-4">
          <X size={24} />
          <p className="text-sm font-bold">
            Supabase Not Connected. Changes will not be saved.
          </p>
        </div>
      )}

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
            onClick={() => setIsImportModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 transition-all cursor-pointer border border-slate-700"
          >
            <ClipboardPaste size={20} />
            PASTE IMPORT
          </button>
          <button
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
