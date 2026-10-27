import React from 'react';
import { DutyRow, Officer } from '../types/roster';
import { resolveOfficerAndSquad } from '../utils/whatsapp';

interface PrintRosterViewProps {
  roster: DutyRow[];
  officersMap?: Record<string, Officer>;
  officers?: Officer[];
  monthNameGu: string;
  year: number;
}

export const PrintRosterView: React.FC<PrintRosterViewProps> = ({
  roster,
  officersMap = {},
  officers = [],
  monthNameGu,
  year,
}) => {
  const renderPrintCell = (val: string, fallback?: string) => {
    const resolved = resolveOfficerAndSquad(val, officersMap, officers, fallback);
    return (
      <div className="leading-tight py-0.5">
        <div className="font-bold text-[10px]">{resolved.name}</div>
        <div className="text-[9px] text-slate-700 font-mono">({resolved.squadFormatted})</div>
      </div>
    );
  };

  return (
    <div className="hidden print:block p-4 bg-white text-black text-xs font-serif leading-tight">
      {/* Official Police Order Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <div className="font-bold text-sm tracking-wider uppercase">
          ક્રાઇમ બ્રાન્ચ - અમદાવાદ શહેર
        </div>
        <div className="font-bold text-base mt-0.5">
          નાઈટ પેટ્રોલીંગ અને બંદોબસ્ત ફરજ પત્રક (૧ થી ૩૦)
        </div>
        <div className="text-xs font-semibold mt-1">
          માહે: {monthNameGu} - {year} (સમય: રાત્રે ૨૦:૦૦ થી સવારે ૦૮:૦૦ કલાક)
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black text-center text-[10px]">
        <thead>
          <tr className="bg-slate-200 border-b border-black font-bold">
            <th className="border border-black p-1.5 w-16">તારીખ</th>
            <th className="border border-black p-1.5 w-14">વાર</th>
            <th className="border border-black p-1.5">કોમ્યુનલ નાઈટ (PI)</th>
            <th className="border border-black p-1.5">ડીવીઝન નાઈટ (PI)</th>
            <th className="border border-black p-1.5">CM મોરચો (PSI)</th>
            <th className="border border-black p-1.5">કેમ્પસ નાઈટ (PSI)</th>
            <th className="border border-black p-1.5">VVIP બંદોબસ્ત (PSI)</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((row) => (
            <tr key={row.date} className="border-b border-black">
              <td className="border border-black p-1 font-mono font-bold">{row.date}</td>
              <td className="border border-black p-1">{row.dayName}</td>
              <td className="border border-black p-1">{renderPrintCell(row.communalPi, 'PI શ્રી, સ્કોડ-૦૧')}</td>
              <td className="border border-black p-1">{renderPrintCell(row.divisionPi, 'PI શ્રી, સ્કોડ-૦૮')}</td>
              <td className="border border-black p-1">{renderPrintCell(row.cmMorchoPsi, 'સ્કોડ-૦૯')}</td>
              <td className="border border-black p-1">{renderPrintCell(row.campusPsi, 'સ્કોડ-૦૧')}</td>
              <td className="border border-black p-1">{renderPrintCell(row.vvipPsi, 'સ્કોડ-૦૬')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Official Signatures */}
      <div className="mt-8 grid grid-cols-3 gap-6 pt-6 text-center text-xs font-semibold">
        <div>
          <div className="h-10 border-b border-dotted border-black mx-4 mb-1"></div>
          <div>પોલીસ ઇન્સ્પેક્ટર (રીડર)</div>
          <div className="text-[10px] font-normal text-slate-700">પોલીસ કમિશનર કચેરી</div>
        </div>
        <div>
          <div className="h-10 border-b border-dotted border-black mx-4 mb-1"></div>
          <div>સહાયક પોલીસ કમિશનર (ACP)</div>
          <div className="text-[10px] font-normal text-slate-700">કંટ્રોલ રૂમ / વહીવટ</div>
        </div>
        <div>
          <div className="h-10 border-b border-dotted border-black mx-4 mb-1"></div>
          <div>નાયબ પોલીસ કમિશનર (DCP)</div>
          <div className="text-[10px] font-normal text-slate-700">હેડક્વાર્ટર / વહીવટ</div>
        </div>
      </div>
    </div>
  );
};
