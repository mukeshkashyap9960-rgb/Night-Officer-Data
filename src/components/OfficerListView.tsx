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
  ChevronDown
} from 'lucide-react';
import { Officer } from '../types/roster';
import { supabase, TABLES } from '../utils/supabaseClient';

interface OfficerListViewProps {
  lang: 'gu' | 'en';
}

export const OfficerListView: React.FC<OfficerListViewProps> = ({ lang }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PI' | 'PSI'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchOfficers();
  }, []);

  async function fetchOfficers() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLES.OFFICERS)
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setOfficers(data);
    }
    setLoading(false);
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
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', count: officers.length, color: 'blue' },
            { label: 'PI Units', count: piCount, color: 'indigo' },
            { label: 'PSI Units', count: psiCount, color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-slate-950 border border-slate-800 px-6 py-4 rounded-[2rem] text-center shadow-2xl flex flex-col items-center justify-center min-w-[120px]`}>
               <p className={`text-[11px] font-black text-${stat.color}-500 uppercase tracking-widest mb-1`}>{stat.label}</p>
               <p className="text-3xl font-black text-white leading-none">{stat.count}</p>
            </div>
          ))}
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
               onClick={() => setViewMode('grid')}
               className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-blue-500 shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
             >
                <LayoutGrid size={20} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-800 text-blue-500 shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
             >
                <ListIcon size={20} />
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
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8" 
          : "flex flex-col gap-4"
        }>
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
                className={`bg-slate-900 border border-slate-800/80 transition-all group shadow-2xl relative overflow-hidden flex ${
                  viewMode === 'grid' 
                    ? 'flex-col p-10 rounded-[3rem] gap-8 hover:border-blue-500/40 hover:shadow-blue-900/10' 
                    : 'flex-row items-center p-6 rounded-[2rem] gap-6 hover:bg-slate-800/40'
                }`}
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 opacity-5 transition-transform group-hover:scale-125 group-hover:rotate-12 pointer-events-none ${o.category === 'PI' ? 'text-blue-500' : 'text-emerald-500'}`}>
                   <Shield className="w-full h-full" />
                </div>

                <div className={`flex items-center gap-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={`rounded-3xl flex items-center justify-center shadow-2xl shrink-0 ${
                    viewMode === 'grid' ? 'w-20 h-20' : 'w-14 h-14'
                  } ${
                    o.category === 'PI' 
                      ? 'bg-blue-600/20 text-blue-500 border border-blue-500/20' 
                      : 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    <User size={viewMode === 'grid' ? 40 : 28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-[0.1em] border ${
                        o.category === 'PI' ? 'bg-blue-950/50 text-blue-400 border-blue-800' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                      }`}>
                        {o.category}
                      </span>
                      <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest">{o.squad}</span>
                    </div>
                    <h4 className={`${viewMode === 'grid' ? 'text-3xl' : 'text-xl'} font-black text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight`}>
                      {o.name}
                    </h4>
                    {viewMode === 'list' && <p className="text-slate-500 font-bold text-sm mt-1">{o.rank}</p>}
                  </div>
                </div>

                <div className={`${viewMode === 'grid' ? 'space-y-4' : 'flex items-center gap-8 px-8 border-l border-slate-800'}`}>
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-5 p-5 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                      <BadgeCheck className="text-blue-500 shrink-0" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Designation</p>
                        <p className="text-xl font-bold text-slate-200">{o.rank || 'General Officer'}</p>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center gap-5 p-5 bg-slate-950/50 rounded-3xl border border-slate-800/50 ${viewMode === 'list' ? 'border-none bg-transparent p-0' : ''}`}>
                    <Phone className="text-emerald-500 shrink-0" size={viewMode === 'grid' ? 24 : 20} />
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Contact Line</p>
                      <a href={`tel:${o.phone}`} className={`${viewMode === 'grid' ? 'text-2xl' : 'text-lg'} font-mono font-black text-emerald-500 hover:text-emerald-400 transition-colors`}>
                        {o.phone || '982XXXXXXX'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className={`${viewMode === 'grid' ? 'w-full' : 'w-auto'}`}>
                  <button 
                    onClick={() => window.open(`https://wa.me/91${o.phone}`, '_blank')}
                    className={`bg-slate-950 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all border border-slate-800 hover:border-emerald-500 cursor-pointer shadow-inner active:scale-[0.95] ${
                      viewMode === 'grid' ? 'w-full py-5 text-base' : 'px-8 py-3 text-sm'
                    }`}
                  >
                    <MessageSquare size={viewMode === 'grid' ? 20 : 16} />
                    SEND NOTIFICATION
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
