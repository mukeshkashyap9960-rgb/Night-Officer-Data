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

interface TodayDutyCardProps {
  dutyRow: DutyRow;
  officersMap: Record<string, Officer>;
  onSendWhatsApp: (squad: string, dutyType: string, dutyTitleGu: string) => void;
  onSwapDuty: (date: string, dutyColumnId: string) => void;
  onBroadcast: (type: 'PI' | 'PSI', dutyRow: DutyRow) => void;
  lang: 'gu' | 'en';
}

export const TodayDutyCard: React.FC<TodayDutyCardProps> = ({
  dutyRow,
  officersMap,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-blue-500">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">{lang === 'gu' ? 'આજની ફરજ વિગત' : 'Active Duty Allocation'}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{dutyRow.date} • {dutyRow.dayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBroadcast('PI', dutyRow)}
            className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-xs font-bold hover:bg-blue-600/20 transition-all cursor-pointer border border-blue-600/20"
          >
            PI List
          </button>
          <button
            onClick={() => onBroadcast('PSI', dutyRow)}
            className="px-4 py-2 bg-emerald-600/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-600/20 transition-all cursor-pointer border border-emerald-600/20"
          >
            PSI List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {dutyItems.map((item) => {
          const officer = officersMap[item.squad];
          
          return (
            <div
              key={item.key}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${item.color}-500/10 text-${item.color}-500 border border-${item.color}-500/20`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{item.role} ROLE</span>
                </div>

                <h4 className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{item.titleGu}</h4>
                <div className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {officer ? officer.name : item.squad}
                </div>
                
                {officer && (
                  <div className="space-y-1 mb-4">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Shield size={10} className="text-blue-500" />
                      {officer.rank}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Phone size={10} className="text-slate-600" />
                      {officer.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSendWhatsApp(item.squad, item.key, item.titleGu)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-950 text-emerald-500 rounded-xl text-[10px] font-bold border border-slate-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </button>
                <button
                  onClick={() => onSwapDuty(dutyRow.date, item.key)}
                  className="p-2 bg-slate-950 text-slate-400 rounded-xl border border-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer"
                >
                  <ArrowRightLeft size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
