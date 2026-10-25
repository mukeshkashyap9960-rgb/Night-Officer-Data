import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, Phone, Filter, X, Save } from 'lucide-react';
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

  useEffect(() => {
    if (supabase) {
      fetchOfficers();
    } else {
      setLoading(false);
      // Optional: Seed with default data for preview if Supabase is missing
      // import { DEFAULT_OFFICERS } from '../data/rosterData';
      // setOfficers(DEFAULT_OFFICERS);
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
      // Update
      result = await supabase
        .from(TABLES.OFFICERS)
        .update(officerData)
        .eq('id', id);
    } else {
      // Insert
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

    if (!error) {
      fetchOfficers();
    }
  }

  const filteredOfficers = officers.filter(o => {
    const matchesSearch = 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.squad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm);
    const matchesCategory = categoryFilter === 'ALL' || o.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {!supabase && (
        <div className="bg-amber-900/20 border border-amber-800 text-amber-500 px-4 py-3 rounded-xl flex items-center gap-3">
          <X size={20} />
          <p className="text-sm font-bold">
            {lang === 'gu' 
              ? 'Supabase સેટિંગ્સ મળ્યા નથી. ડેટા સેવ કરવા માટે કૃપા કરીને .env માં VITE_SUPABASE_URL અને VITE_SUPABASE_ANON_KEY સેટ કરો.' 
              : 'Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable database saving.'}
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-blue-500" />
            {lang === 'gu' ? 'અધિકારી ડાયરેક્ટરી' : 'Officer Directory'}
          </h2>
          <p className="text-slate-400 text-sm">
            {lang === 'gu' ? 'તમામ PI અને PSI અધિકારીઓની યાદી અને વિગતો' : 'List of all PI and PSI officers'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOfficer({ id: 'new-' + Date.now(), squad: '', category: 'PI', name: '', rank: '', phone: '', branch: '' });
            setIsAddOfficerModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          {lang === 'gu' ? 'નવા અધિકારી ઉમેરો' : 'Add New Officer'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder={lang === 'gu' ? 'નામ, સ્કોડ અથવા નંબર શોધો...' : 'Search name, squad or number...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
          {(['ALL', 'PI', 'PSI'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? (lang === 'gu' ? 'બધા' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">{lang === 'gu' ? 'કેટેગરી' : 'Cat'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">{lang === 'gu' ? 'સ્કોડ' : 'Squad'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">{lang === 'gu' ? 'નામ' : 'Name'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">{lang === 'gu' ? 'હોદ્દો' : 'Rank'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">{lang === 'gu' ? 'મોબાઇલ' : 'Phone'}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest text-right">{lang === 'gu' ? 'ક્રિયાઓ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    {lang === 'gu' ? 'લોડ થઈ રહ્યું છે...' : 'Loading officers...'}
                  </div>
                </td>
              </tr>
            ) : filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  {lang === 'gu' ? 'કોઈ ડેટા મળ્યો નથી' : 'No officers found'}
                </td>
              </tr>
            ) : (
              filteredOfficers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      o.category === 'PI' ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                    }`}>
                      {o.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-slate-300 font-mono">{o.squad}</td>
                  <td className="px-6 py-4 text-base font-bold text-white">{o.name}</td>
                  <td className="px-6 py-4 text-base text-slate-400">{o.rank}</td>
                  <td className="px-6 py-4 text-base text-blue-400 font-mono">{o.phone}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingOfficer(o);
                        setIsAddOfficerModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer inline-flex"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(o.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition-all cursor-pointer inline-flex"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isAddModalOpen && editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-xl font-bold text-white">
                {editingOfficer.id?.startsWith('new-') ? (lang === 'gu' ? 'નવા અધિકારી ઉમેરો' : 'Add New Officer') : (lang === 'gu' ? 'વિગતો સુધારો' : 'Edit Officer')}
              </h3>
              <button onClick={() => setIsAddOfficerModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveOfficer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'gu' ? 'કેટેગરી' : 'Category'}</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingOfficer.category}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, category: e.target.value as 'PI' | 'PSI' })}
                  >
                    <option value="PI">PI</option>
                    <option value="PSI">PSI</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'gu' ? 'સ્કોડ' : 'Squad'}</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="સ્કોડ-૦૧"
                    value={editingOfficer.squad}
                    onChange={(e) => setEditingOfficer({ ...editingOfficer, squad: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'gu' ? 'નામ' : 'Full Name'}</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="અધિકારીનું નામ"
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'gu' ? 'હોદ્દો' : 'Designation'}</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="પોલીસ અધિકારી"
                  value={editingOfficer.rank}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, rank: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'gu' ? 'મોબાઇલ નંબર' : 'Mobile Number'}</label>
                <input
                  type="tel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="98XXXXXXXX"
                  value={editingOfficer.phone}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, phone: e.target.value })}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/20"
                >
                  <Save size={18} />
                  {lang === 'gu' ? 'સાચવો' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
