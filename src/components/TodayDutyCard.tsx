import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  ArrowRightLeft, 
  UserCheck, 
  AlertTriangle,
  Send,
  Shield,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';
import { formatSquadText } from '../utils/whatsapp';

interface TodayDutyCardProps {
  dutyRow: DutyRow;
  officersMap: Record<string, Officer>;
  officers?: Officer[];
  onSendWhatsApp: (squad: string, dutyType: string, dutyTitleGu: string) => void;
  onSwapDuty: (date: string, dutyColumnId: string) => void;
  onUpdateDivisionArea?: (date: string, area: string) => void;
  onBroadcast: (type: 'PI' | 'PSI', dutyRow: DutyRow) => void;
  lang: 'gu' | 'en';
}

export const TodayDutyCard: React.FC<TodayDutyCardProps> = ({
  dutyRow,
  officersMap,
  officers = [],
  onSendWhatsApp,
  onSwapDuty,
  onUpdateDivisionArea,
  onBroadcast,
  lang,
}) => {
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [areaInput, setAreaInput] = useState(dutyRow.divisionArea || '');

  const todayObj = new Date();
  const todayStr = `${todayObj.getDate()}/${todayObj.getMonth() + 1}/${todayObj.getFullYear()}`;
  const isToday = dutyRow.date === todayStr;

  useEffect(() => {
    setAreaInput(dutyRow.divisionArea || '');
    setIsEditingArea(false);
  }, [dutyRow.date, dutyRow.divisionArea]);

  const handleSaveArea = (valToSave?: string) => {
    const finalVal = (valToSave !== undefined ? valToSave : areaInput).trim();
    if (onUpdateDivisionArea) {
      onUpdateDivisionArea(dutyRow.date, finalVal);
    }
    setAreaInput(finalVal);
    setIsEditingArea(false);
  };

  const dutyItems = [
    {
      key: 'communalPi',
      titleGu: 'કોમ્યુનલ નાઈટ (PI)',
      role: 'PI',
      squad: dutyRow.communalPi,
      color: 'blue',
      icon: Shield
    },
    {
      key: 'divisionPi',
      titleGu: 'ડીવીઝન નાઈટ (PI)',
      role: 'PI',
      squad: dutyRow.divisionPi,
      color: 'indigo',
      icon: Shield
    },
    {
      key: 'cmMorchoPsi',
      titleGu: 'CM મોરચો (PSI)',
      role: 'PSI',
      squad: dutyRow.cmMorchoPsi,
      color: 'amber',
      icon: MapPin
    },
    {
      key: 'campusPsi',
      titleGu: 'કેમ્પસ નાઈટ (PSI)',
      role: 'PSI',
      squad: dutyRow.campusPsi,
      color: 'emerald',
      icon: MapPin
    },
  ];

  return (
    <div className={`space-y-6 ${isToday ? 'p-2 rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-blue-600/20 border border-amber-400/50 shadow-2xl ring-1 ring-amber-400/30' : ''}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shadow-sm ${
            isToday ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-900 border-slate-800 text-blue-500'
          }`}>
            <Clock size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isToday ? (lang === 'gu' ? 'આજની ફરજ વિગત' : 'Today\'s Duty Allocation') : (lang === 'gu' ? 'તારીખ વાઇઝ ફરજ વિગત' : 'Date Duty Allocation')}
              </h3>
              {isToday && (
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-md animate-pulse">
                  ★ {lang === 'gu' ? 'આજની તારીખ (TODAY)' : 'TODAY'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mt-0.5">
              {dutyRow.date} • {dutyRow.dayName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onBroadcast('PI', dutyRow)}
            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 rounded-xl text-xs font-black transition-all cursor-pointer border border-blue-600/30 shadow-sm"
          >
            PI પત્રક
          </button>
          <button
            onClick={() => onBroadcast('PSI', dutyRow)}
            className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-400 rounded-xl text-xs font-black transition-all cursor-pointer border border-emerald-600/30 shadow-sm"
          >
            PSI પત્રક
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dutyItems.map((item) => {
          const officer = officersMap[item.squad] || officers.find(o => o.name === item.squad || o.squad === item.squad || o.id === item.squad);
          const formattedSquad = formatSquadText(officer?.squad || item.squad) || officer?.squad || item.squad;
          
          return (
            <div
              key={item.key}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              <div 
                onClick={() => onSwapDuty(dutyRow.date, item.key)}
                className="cursor-pointer"
                title={lang === 'gu' ? 'સ્વેપ કરવા માટે ક્લિક કરો' : 'Click to swap officer'}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${item.color}-500/10 text-${item.color}-500 border border-${item.color}-500/20`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.role} ROLE</span>
                </div>

                <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">{item.titleGu}</h4>
                <div className="text-xl sm:text-2xl font-black text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors">
                  {officer ? officer.name : item.squad}
                </div>
                
                {item.key === 'divisionPi' && (
                  <div 
                    className="mb-4 p-3 bg-indigo-950/60 border border-indigo-700/50 rounded-xl transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isEditingArea ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-indigo-400" />
                            {lang === 'gu' ? 'ડીવીજન વિસ્તાર પસંદ / લખો:' : 'Division Area:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingArea(false)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title={lang === 'gu' ? 'બંધ કરો' : 'Close'}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={areaInput}
                            onChange={(e) => setAreaInput(e.target.value)}
                            placeholder={lang === 'gu' ? 'દા.ત. એ-ડીવીઝન, સેક્ટર-૨...' : 'e.g. A-Division, Sector-2...'}
                            className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveArea();
                              if (e.key === 'Escape') setIsEditingArea(false);
                            }}
                          />
                        </div>

                        {/* Quick Selection Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {['એ-ડીવીઝન', 'બી-ડીવીઝન', 'સી-ડીવીઝન', 'ડી-ડીવીઝન', 'સેક્ટર-૧', 'સેક્ટર-૨'].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => {
                                setAreaInput(chip);
                                handleSaveArea(chip);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                areaInput === chip
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                                  : 'bg-indigo-950 hover:bg-indigo-800 text-indigo-200 border-indigo-800/60'
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveArea()}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Check size={13} className="stroke-[3]" />
                            <span>{lang === 'gu' ? 'સેવ કરો' : 'Save'}</span>
                          </button>
                          {dutyRow.divisionArea && (
                            <button
                              type="button"
                              onClick={() => handleSaveArea('')}
                              className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold border border-rose-800/50 cursor-pointer transition-colors"
                              title={lang === 'gu' ? 'વિસ્તાર કાઢી નાખો' : 'Remove area'}
                            >
                              {lang === 'gu' ? 'કાઢી નાખો' : 'Clear'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setAreaInput(dutyRow.divisionArea || '');
                              setIsEditingArea(false);
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            {lang === 'gu' ? 'રદ' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-1.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-indigo-400" />
                            {lang === 'gu' ? 'ડીવીજન વિસ્તાર:' : 'Division Area:'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAreaInput(dutyRow.divisionArea || '');
                              setIsEditingArea(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                          >
                            <span>{dutyRow.divisionArea ? (lang === 'gu' ? 'બદલો' : 'Edit') : (lang === 'gu' ? '+ વિસ્તાર ઉમેરો' : '+ Add Area')}</span>
                          </button>
                        </div>
                        <div 
                          onClick={() => {
                            setAreaInput(dutyRow.divisionArea || '');
                            setIsEditingArea(true);
                          }}
                          className="cursor-pointer group/area p-1.5 rounded-lg hover:bg-indigo-900/30 transition-all border border-transparent hover:border-indigo-700/40"
                          title={lang === 'gu' ? 'વિસ્તાર બદલવા માટે ક્લિક કરો' : 'Click to edit area'}
                        >
                          {dutyRow.divisionArea ? (
                            <p className="text-white font-black text-sm flex items-center gap-2">
                              <span className="bg-indigo-600/30 text-indigo-200 px-2.5 py-0.5 rounded-md border border-indigo-500/40 font-bold">
                                {dutyRow.divisionArea}
                              </span>
                            </p>
                          ) : (
                            <p className="text-indigo-300/80 text-xs italic flex items-center gap-1 group-hover/area:text-indigo-200">
                              <span>{lang === 'gu' ? '+ વિસ્તાર નિર્ધારિત નથી (અહીં ક્લિક કરી ઉમેરો)' : '+ No area assigned (Click to add)'}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 mb-6">
                  <p className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1.5">
                    <span className="bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/30">
                      {formattedSquad}
                    </span>
                    {officer?.rank && (
                      <span className="text-slate-400 text-[11px] font-bold">
                        {officer.rank}
                      </span>
                    )}
                  </p>
                  {officer?.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono font-bold">
                      <Phone size={13} className="text-slate-500" />
                      {officer.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onSendWhatsApp(item.squad, item.key, item.titleGu)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 text-emerald-400 rounded-xl text-xs font-bold border border-slate-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => onSwapDuty(dutyRow.date, item.key)}
                  className="flex items-center justify-center gap-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black border border-blue-500 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={lang === 'gu' ? 'સ્વેપ / બદલો' : 'Swap Officer'}
                >
                  <ArrowRightLeft size={14} className="stroke-[2.5]" />
                  <span>{lang === 'gu' ? 'સ્વેપ' : 'Swap'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
