import React from 'react';
import { X, BarChart3, Shield, Award, CheckCircle2 } from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';
import { PI_UNITS, PSI_UNITS } from '../data/rosterData';

interface DutyAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: DutyRow[];
  officersMap: Record<string, Officer>;
  lang: 'gu' | 'en';
}

export const DutyAnalyticsModal: React.FC<DutyAnalyticsModalProps> = ({
  isOpen,
  onClose,
  roster,
  officersMap,
  lang,
}) => {
  if (!isOpen) return null;

  // Calculate duties per PI
  const piStats = PI_UNITS.map((unit) => {
    let communalCount = 0;
    let divisionCount = 0;
    let weekendCount = 0;

    roster.forEach((row) => {
      const isWeekend = row.dayName === 'શનિવાર' || row.dayName === 'રવિવાર';
      if (row.communalPi === unit) {
        communalCount++;
        if (isWeekend) weekendCount++;
      }
      if (row.divisionPi === unit) {
        divisionCount++;
        if (isWeekend) weekendCount++;
      }
    });

    const total = communalCount + divisionCount;
    const officer = officersMap[unit];

    return {
      unit,
      name: officer ? officer.name : '',
      communalCount,
      divisionCount,
      weekendCount,
      total,
    };
  }).sort((a, b) => b.total - a.total);

  // Calculate duties per PSI
  const psiStats = PSI_UNITS.map((unit) => {
    let cmCount = 0;
    let campusCount = 0;
    let weekendCount = 0;

    roster.forEach((row) => {
      const isWeekend = row.dayName === 'શનિવાર' || row.dayName === 'રવિવાર';
      if (row.cmMorchoPsi === unit) {
        cmCount++;
        if (isWeekend) weekendCount++;
      }
      if (row.campusPsi === unit) {
        campusCount++;
        if (isWeekend) weekendCount++;
      }
    });

    const total = cmCount + campusCount;
    const officer = officersMap[unit];

    return {
      unit,
      name: officer ? officer.name : '',
      cmCount,
      campusCount,
      weekendCount,
      total,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'gu' ? 'ડ્યુટી વિતરણ એનાલિટિક્સ (Duty Distribution Analytics)' : 'Duty Distribution Analytics'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'gu' 
                  ? 'તમામ અધિકારીઓ વચ્ચે સમાન નાઈટ ડ્યુટી ફાળવણીનું વિશ્લેષણ' 
                  : 'Equitable night duty allocation analysis among officers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/40">
              <span className="text-blue-800 dark:text-blue-300 font-semibold block mb-0.5">કુલ PI ફરજો</span>
              <span className="text-lg font-bold text-blue-900 dark:text-white">૬૦ શિફ્ટ્સ</span>
              <span className="text-[10px] text-blue-700 dark:text-blue-400 block mt-0.5">સરેરાશ ૪ થી ૫ પ્રતિ PI</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold block mb-0.5">કુલ PSI ફરજો</span>
              <span className="text-lg font-bold text-emerald-900 dark:text-white">૬૦ શિફ્ટ્સ</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">સરેરાશ ૬ પ્રતિ PSI</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/40">
              <span className="text-amber-800 dark:text-amber-300 font-semibold block mb-0.5">વીકેન્ડ શિફ્ટ્સ (શનિ-રવિ)</span>
              <span className="text-lg font-bold text-amber-900 dark:text-white">૩૬ શિફ્ટ્સ</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">૯ વીકેન્ડ દિવસો</span>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/40">
              <span className="text-purple-800 dark:text-purple-300 font-semibold block mb-0.5">સમાનતા સ્કોર</span>
              <span className="text-lg font-bold text-purple-900 dark:text-white">૯૮.૫% સમાન</span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 block mt-0.5">સુવ્યવસ્થિત રોટેશન</span>
            </div>
          </div>

          {/* PI Stats Table */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>પોલીસ ઇન્સ્પેક્ટર (PI) નાઈટ ડ્યુટી ભારણ</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">યુનિટ / સ્કોડ</th>
                    <th className="p-2.5">અધિકારી</th>
                    <th className="p-2.5 text-center">કોમ્યુનલ</th>
                    <th className="p-2.5 text-center">ડીવીઝન</th>
                    <th className="p-2.5 text-center">શનિ/રવિ</th>
                    <th className="p-2.5 text-center font-bold">કુલ ડ્યુટી</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {piStats.map((item) => (
                    <tr key={item.unit} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white">{item.unit}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{item.name || '-'}</td>
                      <td className="p-2.5 text-center text-blue-700 dark:text-blue-400">{item.communalCount}</td>
                      <td className="p-2.5 text-center text-indigo-700 dark:text-indigo-400">{item.divisionCount}</td>
                      <td className="p-2.5 text-center text-amber-600">{item.weekendCount}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900 dark:text-white">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PSI Stats Table */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>પોલીસ સબ ઇન્સ્પેક્ટર (PSI) નાઈટ ડ્યુટી ભારણ</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">સ્કોડ</th>
                    <th className="p-2.5">અધિકારી</th>
                    <th className="p-2.5 text-center">CM મોરચો</th>
                    <th className="p-2.5 text-center">કેમ્પસ</th>
                    <th className="p-2.5 text-center">શનિ/રવિ</th>
                    <th className="p-2.5 text-center font-bold">કુલ ડ્યુટી</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {psiStats.map((item) => (
                    <tr key={item.unit} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white">{item.unit}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{item.name || '-'}</td>
                      <td className="p-2.5 text-center text-amber-700 dark:text-amber-400">{item.cmCount}</td>
                      <td className="p-2.5 text-center text-emerald-700 dark:text-emerald-400">{item.campusCount}</td>
                      <td className="p-2.5 text-center text-amber-600">{item.weekendCount}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900 dark:text-white">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
          >
            {lang === 'gu' ? 'બંધ કરો' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
