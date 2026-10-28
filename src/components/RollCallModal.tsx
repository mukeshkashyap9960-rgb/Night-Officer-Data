import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Share2, 
  ShieldCheck, 
  Radio, 
  FileCheck2 
} from 'lucide-react';
import { DutyRow, Officer } from '../types/roster';
import { generateDutyWhatsAppUrl } from '../utils/whatsapp';

interface RollCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  dutyRow: DutyRow;
  officersMap: Record<string, Officer>;
  onSaveAttendance: (date: string, attendanceData: any) => void;
  lang: 'gu' | 'en';
}

export const RollCallModal: React.FC<RollCallModalProps> = ({
  isOpen,
  onClose,
  dutyRow,
  officersMap,
  onSaveAttendance,
  lang,
}) => {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'leave'>>({
    communalPi: (dutyRow.attendance?.communalPi as any) || 'present',
    divisionPi: (dutyRow.attendance?.divisionPi as any) || 'present',
    cmMorchoPsi: (dutyRow.attendance?.cmMorchoPsi as any) || 'present',
    campusPsi: (dutyRow.attendance?.campusPsi as any) || 'present',
    vvipPsi: (dutyRow.attendance?.vvipPsi as any) || 'present',
  });

  const [callSigns, setCallSigns] = useState<Record<string, string>>({
    communalPi: 'મોબાઇલ-૧ (Alpha-1)',
    divisionPi: 'મોબાઇલ-૨ (Bravo-2)',
    cmMorchoPsi: 'પોઇન્ટ-૪ (Charlie-4)',
    campusPsi: 'કંટ્રોલ-૫ (HQ-Campus)',
    vvipPsi: 'કોન્વોય-૩ (Delta-3)',
  });

  if (!isOpen) return null;

  const posts = [
    { key: 'communalPi', labelGu: 'કોમ્યુનલ નાઈટ (PI)', squad: dutyRow.communalPi },
    { key: 'divisionPi', labelGu: 'ડીવીઝન નાઈટ (PI)', squad: dutyRow.divisionPi },
    { key: 'cmMorchoPsi', labelGu: 'CM મોરચો (PSI)', squad: dutyRow.cmMorchoPsi },
    { key: 'campusPsi', labelGu: 'કેમ્પસ નાઈટ (PSI)', squad: dutyRow.campusPsi },
  ];

  const handleStatusChange = (postKey: string, status: 'present' | 'absent' | 'leave') => {
    setAttendance((prev) => ({ ...prev, [postKey]: status }));
  };

  const handleSave = () => {
    onSaveAttendance(dutyRow.date, {
      ...attendance,
      checkedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    onClose();
  };

  const getStatusTextGu = (status: 'present' | 'absent' | 'leave') => {
    if (status === 'present') return '✅ હાજર (Present)';
    if (status === 'absent') return '❌ ગેરહાજર (Absent)';
    return '🟡 રજા (On Leave)';
  };

  const generateRollCallReport = () => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let text = `🚨 *ક્રાઇમ બ્રાન્ચ - નાઈટ ડ્યુટી રોલ-કોલ રીપોર્ટ* 🚨\n`;
    text += `📅 *તારીખ:* ${dutyRow.date} (${dutyRow.dayName})\n`;
    text += `⏰ *રોલ-કોલ સમય:* ${time} કલાકે\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;

    posts.forEach((p, idx) => {
      const off = officersMap[p.squad];
      const offName = off ? off.name : p.squad;
      const status = attendance[p.key] || 'present';
      const call = callSigns[p.key] || '';
      text += `${idx + 1}. *${p.labelGu}*\n`;
      text += `   ↳ ${p.squad} (${offName})\n`;
      text += `   ↳ સ્ટેટસ: ${getStatusTextGu(status)} | વાયરલેસ: ${call}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `સર્વે પોઈન્ટ્સ પર પેટ્રોલિંગ ચાલુ છે.\nકંટ્રોલ રૂમ વાયરલેસ ઓપરેટર.\nજય હિન્દ! 🇮🇳`;
    return text;
  };

  const waReportUrl = generateDutyWhatsAppUrl({
    phone: '',
    message: generateRollCallReport(),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 rounded-lg">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'gu' ? 'ડિજિટલ રોલ-કોલ રજીસ્ટર (Digital Roll-Call)' : 'Night Roll-Call Register'}
              </h3>
              <p className="text-xs text-slate-400">
                {dutyRow.date} · {dutyRow.dayName} · રાત્રિ ૨૦:૦૦ શિફ્ટ રિપોર્ટિંગ
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            {lang === 'gu'
              ? 'નાઈટ શિફ્ટ શરૂ થતા વાયરલેસ સેટથી અધિકારીઓની હાજરી ચકાસો અને સ્ટેટસ નોંધો:'
              : 'Verify attendance of officers via wireless VHF set and log attendance:'}
          </p>

          <div className="space-y-3">
            {posts.map((post) => {
              const off = officersMap[post.squad];
              const currentStatus = attendance[post.key] || 'present';

              return (
                <div
                  key={post.key}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {post.labelGu}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                      {post.squad} {off ? `· ${off.name}` : ''}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      વાયરલેસ: {callSigns[post.key]}
                    </div>
                  </div>

                  {/* Attendance Selector Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(post.key, 'present')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      હાજર
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(post.key, 'leave')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        currentStatus === 'leave'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      રજા
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(post.key, 'absent')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ગેરહાજર
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick WhatsApp Share Button */}
          <div className="pt-2">
            <a
              href={waReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>આ રોલ-કોલ રીપોર્ટ WhatsApp પર અધિકારીઓ / કંટ્રોલ રૂમ ગ્રૂપમાં મોકલો</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            રદ કરો
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
          >
            હાજરી સેવ કરો
          </button>
        </div>

      </div>
    </div>
  );
};
