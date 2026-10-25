import React, { useState } from 'react';
import { X, ArrowRightLeft, Shield, AlertCircle, Check } from 'lucide-react';
import { PI_UNITS, PSI_UNITS } from '../data/rosterData';

interface DutySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  dutyColumnId: string;
  currentSquad: string;
  onApplySwap: (date: string, dutyColumnId: string, newSquad: string) => void;
  lang: 'gu' | 'en';
}

export const DutySwapModal: React.FC<DutySwapModalProps> = ({
  isOpen,
  onClose,
  date,
  dutyColumnId,
  currentSquad,
  onApplySwap,
  lang,
}) => {
  const [selectedSquad, setSelectedSquad] = useState(currentSquad);

  if (!isOpen) return null;

  const isPI = dutyColumnId === 'communalPi' || dutyColumnId === 'divisionPi';
  const availableSquads = isPI ? PI_UNITS : PSI_UNITS;

  const dutyTitleMap: Record<string, { gu: string; en: string }> = {
    communalPi: { gu: 'કોમ્યુનલ નાઈટ (PI)', en: 'Communal Night (PI)' },
    divisionPi: { gu: 'ડીવીઝન નાઈટ (PI)', en: 'Division Night (PI)' },
    cmMorchoPsi: { gu: 'CM મોરચો (PSI)', en: 'CM Morcho (PSI)' },
    campusPsi: { gu: 'કેમ્પસ નાઈટ (PSI)', en: 'Campus Night (PSI)' },
    vvipPsi: { gu: 'VVIP બંદોબસ્ત (PSI)', en: 'VVIP Bandobast (PSI)' },
  };

  const dutyTitle = dutyTitleMap[dutyColumnId] || { gu: dutyColumnId, en: dutyColumnId };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSquad) {
      onApplySwap(date, dutyColumnId, selectedSquad);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'gu' ? 'ડ્યુટી બદલો / ફેરબદલ (Duty Swap)' : 'Swap Duty Assignment'}
              </h3>
              <p className="text-xs text-slate-400">
                {date} · {lang === 'gu' ? dutyTitle.gu : dutyTitle.en}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              {lang === 'gu' ? 'હાલમાં નિર્ધારિત સ્કોડ:' : 'Currently Assigned Squad:'}
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {currentSquad}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'gu' ? 'નવા અધિકારી / સ્કોડ પસંદ કરો અથવા લખો:' : 'Select or Type Replacement Squad / Officer:'}
              </label>
            </div>
            <div className="space-y-2">
              <select
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {availableSquads.map((squad) => (
                  <option key={squad} value={squad}>
                    {squad}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                placeholder={lang === 'gu' ? 'અથવા મન્યુઅલ નામ/સ્કોડ લખો (દા.ત. PSI શ્રી, સ્કોડ-૦૧)' : 'Or type custom name/squad...'}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              {lang === 'gu'
                ? 'ફેરબદલ કર્યા બાદ તમે નવા અધિકારીને તરત જ WhatsApp પર નવી ડ્યુટી સૂચના મોકલી શકશો.'
                : 'After swapping, you can instantly dispatch the updated WhatsApp duty notification to the new officer.'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'gu' ? 'ફેરબદલ માન્ય કરો' : 'Confirm Swap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
