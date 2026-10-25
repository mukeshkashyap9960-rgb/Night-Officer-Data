import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  ArrowRightLeft, 
  UserCheck, 
  AlertTriangle,
  Send,
  Shield,
  MapPin
} from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';
import { formatSquadText } from '../utils/whatsapp';

interface TodayDutyCardProps {
  dutyRow: DutyRow;
  officersMap: Record<string, Officer>;
  officers?: Officer[];
  onSendWhatsApp: (squad: string, dutyType: string, dutyTitleGu: string) => void;
  onSwapDuty: (date: string, dutyColumnId: string) => void;
  onBroadcast: (type: 'PI' | 'PSI', dutyRow: DutyRow) => void;
  lang: 'gu' | 'en';
}

export const TodayDutyCard: React.FC<TodayDutyCardProps> = ({
  dutyRow,
  officersMap,
  officers = [],
  onSendWhatsApp,
  onSwapDuty,
  onBroadcast,
  lang,
}) => {
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
    {
      key: 'vvipPsi',
      titleGu: 'VVIP બંદોબસ્ત (PSI)',
      role: 'PSI',
      squad: dutyRow.vvipPsi,
      color: 'rose',
      icon: Shield
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-blue-500 shadow-sm">
            <Clock size={22} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">{lang === 'gu' ? 'આજની ફરજ વિગત' : 'Active Duty Allocation'}</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black mt-0.5">
              {dutyRow.date} • {dutyRow.dayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
