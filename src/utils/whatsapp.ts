import { Officer, DutyRow } from '../types/roster';

export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10 && !digits.startsWith('91')) {
    return `91${digits.slice(-10)}`;
  }
  return digits;
}

export function generateDutyWhatsAppUrl(params: {
  phone: string;
  message: string;
}): string {
  const cleaned = cleanPhoneNumber(params.phone || '');
  const encodedText = encodeURIComponent(params.message);
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}

/**
 * Individual message strictly formatted as requested
 */
export function createIndividualDutyMessage(params: {
  officer: Officer | null;
  squadText: string;
  dutyTitleGu: string;
  date: string;
  dayName: string;
}): string {
  const officerName = params.officer ? params.officer.name : params.squadText;
  const officerRank = params.officer ? params.officer.rank : 'પોલીસ અધિકારી';
  const phone = params.officer ? (params.officer.phone || 'ઉપલબ્ધ નથી') : 'ઉપલબ્ધ નથી';

  return `🚨 *ગુજરાત પોલીસ - નાઈટ ડ્યુટી* 🚨
📅 તારીખ: ${params.date} (${params.dayName})
      સ્કોડ : ${params.squadText}
👮 નામ: ${officerName}
🏷️ હોદ્દો: ${officerRank}
🛡️ નાઈટ નો પ્રકાર: ${params.dutyTitleGu}
📞 મોબાઇલ નંબર: ${phone}
જય હિન્દ! 🇮🇳`;
}

/**
 * Separate PI broadcast
 */
export function createPiBroadcastMessage(params: {
  row: DutyRow;
  officersMap: Record<string, Officer>;
}): string {
  const { row, officersMap } = params;
  const getOffDetails = (s: string, dutyType: string) => {
    const o = officersMap[s];
    const name = o ? o.name : s;
    const rank = o ? o.rank : 'પોલીસ ઇન્સ્પેક્ટર';
    const phone = o ? o.phone : 'નથી';
    return `• ${dutyType} \n  નામ: ${name}\n  સ્કોડ : ${s}\n  હોદ્દો: ${rank}\n  મોબાઇલ: ${phone}`;
  };

  return `⭐ *ગુજરાત પોલીસ - PI શ્રી નાઈટ* ⭐
📅 તારીખ: ${row.date} (${row.dayName})
━━━━━━━━━━━━━━━━━━━━
${getOffDetails(row.communalPi, 'કોમ્યુનલ નાઈટ PI શ્રી')}

${getOffDetails(row.divisionPi, 'ડીવીઝન નાઈટ PI શ્રી')}
━━━━━━━━━━━━━━━━━━━━
જય હિન્દ! 🇮🇳`;
}

/**
 * Separate PSI broadcast
 */
export function createPsiBroadcastMessage(params: {
  row: DutyRow;
  nextRow?: DutyRow;
  officersMap: Record<string, Officer>;
}): string {
  const { row, nextRow, officersMap } = params;
  const getOffDetails = (s: string, dutyType: string) => {
    const o = officersMap[s];
    const name = o ? o.name : s;
    const rank = o ? o.rank : 'પોલીસ સબ ઇન્સ્પેક્ટર';
    const phone = o ? o.phone : 'નથી';
    return `• ${dutyType} \n  નામ: ${name}\n  સ્કોડ : ${s}\n  હોદ્દો: ${rank}\n  મોબાઇલ: ${phone}`;
  };

  const nextCmDetails = nextRow 
    ? getOffDetails(nextRow.cmMorchoPsi, `CM મોરચો (આગામી તારીખ: ${nextRow.date})`)
    : '';

  return `⭐ *ગુજરાત પોલીસ - PSI શ્રી નાઈટ* ⭐
📅 તારીખ: ${row.date} (${row.dayName})
━━━━━━━━━━━━━━━━━━━━
${getOffDetails(row.cmMorchoPsi, 'CM મોરચો PSI શ્રી')}

${getOffDetails(row.campusPsi, 'કેમ્પસ નાઈટ PSI શ્રી')}

${getOffDetails(row.vvipPsi, 'VVIP બંદોબસ્ત PSI શ્રી')}

${nextCmDetails ? `\n📌 *આગામી તારીખ મોરચો*\n${nextCmDetails}` : ''}
━━━━━━━━━━━━━━━━━━━━
જય હિન્દ! 🇮🇳`;
}
