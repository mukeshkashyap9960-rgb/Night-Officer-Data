import { Officer, DutyRow } from '../types/roster';
import { DEFAULT_OFFICERS } from '../data/rosterData';

export const GU_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
export const EN_TO_GU: Record<string, string> = {
  '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪',
  '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯'
};
export const GU_TO_EN: Record<string, string> = {
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
};

/**
 * Converts any squad designation into the standard format requested by user:
 * e.g. "PI શ્રી, સ્કોડ-૦૩" -> "સ્કોડ - ૦૩"
 *      "સ્કોડ-૩" -> "સ્કોડ - ૦૩"
 *      "સ્કોડ - ૪" -> "સ્કોડ - ૦૪"
 *      "3" -> "સ્કોડ - ૦૩"
 *      "PI સાયબર ક્રાઇમ" -> "સાયબર ક્રાઇમ"
 *      "PI SOG" -> "SOG"
 *      "PI મહિલા સેલ" -> "મહિલા સેલ"
 *      "PI EOW" -> "EOW"
 */
export function formatSquadText(squadInput: string): string {
  if (!squadInput) return '';
  const text = squadInput.trim();

  // Check special wings first
  if (/સાયબર|Cyber/i.test(text)) return 'સાયબર ક્રાઇમ';
  if (/SOG/i.test(text)) return 'SOG';
  if (/મહિલા|Women/i.test(text)) return 'મહિલા સેલ';
  if (/EOW/i.test(text)) return 'EOW';

  // Convert any Gujarati digits to English to locate numerical squad
  const withEnDigits = text.replace(/[૦-૯]/g, d => GU_TO_EN[d] || d);
  const match = withEnDigits.match(/\d+/);

  if (match) {
    const num = parseInt(match[0], 10);
    // Pad to 2 digits: 3 -> "03", 10 -> "10"
    const padded = num.toString().padStart(2, '0');
    const guDigits = padded.split('').map(d => EN_TO_GU[d] || d).join('');
    return `સ્કોડ - ${guDigits}`;
  }

  // Fallback cleanup
  return text
    .replace(/^PI\s*શ્રી,?\s*/i, '')
    .replace(/-/g, ' - ')
    .trim();
}

/**
 * Resolves officer details and ensures the squad is properly extracted
 * rather than echoing officer names into the squad field.
 */
export function resolveOfficerAndSquad(
  s: string,
  officersMap: Record<string, Officer> = {},
  officersList: Officer[] = [],
  fallbackSquadSlot?: string
): { name: string; squadFormatted: string; rank: string; phone: string } {
  const query = (s || '').trim();

  // If query contains parentheses e.g. "શ્રી આર. કે. જાડેજા (સ્કોડ - ૦૧)"
  let extractedNamePart = '';
  let extractedSquadPart = '';
  const parenMatch = query.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    extractedNamePart = parenMatch[1].trim();
    extractedSquadPart = parenMatch[2].trim();
  }

  // 1. Direct map lookup (officersMap indexed by name, squad, and id)
  let o: Officer | undefined = officersMap[query] || (extractedNamePart ? officersMap[extractedNamePart] : undefined);

  // 2. Search in officersList
  if (!o && officersList.length > 0) {
    o = officersList.find(
      off => off.name === query || 
             off.squad === query || 
             off.id === query ||
             off.phone === query ||
             (extractedNamePart && off.name === extractedNamePart) ||
             (extractedSquadPart && (off.squad === extractedSquadPart || formatSquadText(off.squad) === formatSquadText(extractedSquadPart)))
    );
  }

  // 3. Search in DEFAULT_OFFICERS
  if (!o) {
    o = DEFAULT_OFFICERS.find(
      off => off.name === query || 
             off.squad === query || 
             off.id === query ||
             off.phone === query ||
             (extractedNamePart && off.name === extractedNamePart) ||
             (extractedSquadPart && (off.squad === extractedSquadPart || formatSquadText(off.squad) === formatSquadText(extractedSquadPart)))
    );
  }

  // 4. Try matching normalized squad text
  if (!o && (query.includes('સ્કોડ') || query.includes('PI') || /\d/.test(query))) {
    const sFmt = formatSquadText(extractedSquadPart || query);
    o = officersList.find(off => formatSquadText(off.squad) === sFmt) ||
        DEFAULT_OFFICERS.find(off => formatSquadText(off.squad) === sFmt);
  }

  // Determine officer name
  let name = extractedNamePart || query;
  if (o && o.name) {
    name = o.name;
  } else {
    // If query doesn't match an officer directly, let's check if fallbackSquadSlot or roster context points to a default officer for this slot, or if query is a custom string
    // If query contains custom description like "I Division" but fallbackSquadSlot is e.g. "PI શ્રી, સ્કોડ-૦૮", let's find the officer for fallbackSquadSlot
    if (fallbackSquadSlot) {
      const fallbackOfficer = officersList.find(off => off.squad === fallbackSquadSlot || off.id === fallbackSquadSlot) ||
                              DEFAULT_OFFICERS.find(off => off.squad === fallbackSquadSlot || off.id === fallbackSquadSlot);
      if (fallbackOfficer) {
        o = fallbackOfficer;
        name = fallbackOfficer.name;
      }
    }
  }

  // Strip accidental parenthesis from name
  if (name.includes('(')) {
    name = name.split('(')[0].trim();
  }

  // Determine squad text
  let rawSquad = extractedSquadPart || '';
  if (o && o.squad && o.squad !== o.name) {
    rawSquad = o.squad;
  } else if (o && o.branch && o.branch !== o.name) {
    rawSquad = o.branch;
  } else if (query.includes('સ્કોડ') || query.includes('PI') || /\d/.test(query) || /સાયબર|SOG|મહિલા|EOW/i.test(query)) {
    rawSquad = extractedSquadPart || query;
  } else if (fallbackSquadSlot) {
    rawSquad = fallbackSquadSlot;
  } else {
    // If o was matched by name or phone in default officers
    const def = DEFAULT_OFFICERS.find(d => d.name === name || (o && d.phone === o.phone));
    rawSquad = def ? def.squad : query;
  }

  let squadFormatted = formatSquadText(rawSquad);
  if (!squadFormatted || squadFormatted === name) {
    if (fallbackSquadSlot) {
      squadFormatted = formatSquadText(fallbackSquadSlot);
    } else {
      squadFormatted = rawSquad;
    }
  }

  // Determine rank: enforce clean PI or PSI
  let rank = o?.rank || 'PI';
  if (/પોલીસ ઇન્સ્પેક્ટર/i.test(rank)) {
    rank = 'PI';
  } else if (/પોલીસ સબ ઇન્સ્પેક્ટર/i.test(rank)) {
    rank = 'PSI';
  }

  // Phone: clean 10 digits
  const phone = o ? (o.phone || '').replace(/\D/g, '') : '';

  return { name, squadFormatted, rank, phone };
}

/**
 * Formats a duty slot for download / export as requested:
 * "PI અથવા PSI શ્રી નુ નામ, સ્કોડ નંબર આ ડાઉનલોડ થાય"
 * e.g. "શ્રી આર. કે. જાડેજા (સ્કોડ - ૦૧)"
 */
export function formatDutyForExport(
  s: string,
  officersMap: Record<string, Officer> = {},
  officersList: Officer[] = [],
  fallbackSlot?: string
): string {
  if (!s || !s.trim()) return '';
  const resolved = resolveOfficerAndSquad(s, officersMap, officersList, fallbackSlot);
  
  const name = resolved.name?.trim() || '';
  const squad = resolved.squadFormatted?.trim() || '';
  const rank = resolved.rank?.trim() || 'PI';
  const phone = resolved.phone?.trim() || '';

  const lines = [];
  if (name) lines.push(`નામ: ${name}`);
  if (squad) lines.push(`સ્કોડ: ${squad}`);
  if (rank) lines.push(`હોદ્દો: ${rank}`);
  if (phone) lines.push(`મોબાઇલ: ${phone}`);
  
  return lines.join('\n');
}

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
 * Header changed from "ગુજરાત પોલીસ" to "ક્રાઇમ બ્રાન્ચ"
 * Squad formatted as "સ્કોડ - ૦૩"
 */
export function createIndividualDutyMessage(params: {
  officer: Officer | null;
  squadText: string;
  dutyTitleGu: string;
  date: string;
  dayName: string;
  officersMap?: Record<string, Officer>;
  officersList?: Officer[];
}): string {
  const { officer, squadText, dutyTitleGu, date, dayName, officersMap = {}, officersList = [] } = params;

  const resolved = resolveOfficerAndSquad(
    officer ? (officer.name || officer.squad) : squadText,
    officersMap,
    officersList,
    squadText
  );

  const officerName = officer?.name || resolved.name || squadText;
  const officerRank = resolved.rank || (officer?.category === 'PSI' ? 'PSI' : 'PI');
  const phone = officer?.phone || resolved.phone || 'ઉપલબ્ધ નથી';
  const squadFormatted = resolved.squadFormatted || formatSquadText(squadText);

  if (dutyTitleGu.includes('CM મોરચો') || dutyTitleGu.includes('કેમ્પસ') || dutyTitleGu.includes('VVIP')) {
    const cleanTitle = dutyTitleGu.replace(/\s*\(PSI\)/g, '').trim();
    return `🚨 *ક્રાઇમ બ્રાન્ચ - ${cleanTitle}* 🚨
📅 તારીખ: ${date} (${dayName})
      સ્કોડ : ${squadFormatted}
👮 નામ: ${officerName}
🏷️ હોદ્દો: ${officerRank}
🛡️ પ્રકાર: ${dutyTitleGu}
📞 મોબાઇલ નંબર: ${phone}
જય હિન્દ! 🇮🇳`;
  }

  return `🚨 *ક્રાઇમ બ્રાન્ચ - નાઈટ ડ્યુટી* 🚨
📅 તારીખ: ${date} (${dayName})
      સ્કોડ : ${squadFormatted}
👮 નામ: ${officerName}
🏷️ હોદ્દો: ${officerRank}
🛡️ નાઈટ નો પ્રકાર: ${dutyTitleGu}
📞 મોબાઇલ નંબર: ${phone}
જય હિન્દ! 🇮🇳`;
}

/**
 * Separate PI broadcast
 * Header changed from "ગુજરાત પોલીસ" to "ક્રાઇમ બ્રાન્ચ"
 * Squad formatted as "સ્કોડ - ૦૩"
 */
export function createPiBroadcastMessage(params: {
  row: DutyRow;
  officersMap: Record<string, Officer>;
  officersList?: Officer[];
}): string {
  const { row, officersMap, officersList = [] } = params;
  
  const getOffDetails = (s: string, dutyType: string, fallbackSlot: string) => {
    const resolved = resolveOfficerAndSquad(s, officersMap, officersList, fallbackSlot);
    let typeLine = '';
    const cleanS = (s || '').trim();
    if (cleanS.includes('ડિવીઝન') || cleanS.includes('ડીવીઝન') || cleanS.includes('I ડીવી') || cleanS.includes('K ડીવી') || cleanS.includes('M ડીવી') || cleanS.includes('પ્રકાર')) {
      if (!cleanS.includes('PI શ્રી') && !cleanS.includes('શ્રી')) {
        typeLine = `પ્રકાર : ${cleanS}`;
      }
    }

    return `• ${dutyType}
નામ: ${resolved.name}
સ્કોડ : ${resolved.squadFormatted}
હોદ્દો: ${resolved.rank}${typeLine ? `\n${typeLine}` : ''}
મોબાઇલ: ${resolved.phone}`;
  };

  return `⭐ ક્રાઇમ બ્રાન્ચ - PI શ્રી નાઈટ ⭐
📅 તારીખ: ${row.date} (${row.dayName})
━━━━━━━━━━━━━━━━━━━━
${getOffDetails(row.communalPi, 'કોમ્યુનલ નાઈટ PI શ્રી', 'સ્કોડ-૦૧')}

${getOffDetails(row.divisionPi, 'ડીવીઝન નાઈટ PI શ્રી', 'સ્કોડ-૦૮')}
━━━━━━━━━━━━━━━━━━━━
જય હિન્દ! 🇮🇳`;
}

/**
 * Separate PSI broadcast
 * Header changed from "ગુજરાત પોલીસ" to "ક્રાઇમ બ્રાન્ચ"
 * Squad formatted as "સ્કોડ - ૦૯" etc.
 */
export function createPsiBroadcastMessage(params: {
  row: DutyRow;
  nextRow?: DutyRow;
  officersMap: Record<string, Officer>;
  officersList?: Officer[];
}): string {
  const { row, nextRow, officersMap, officersList = [] } = params;

  const getOffDetails = (s: string, dutyType: string, fallbackSlot: string) => {
    const resolved = resolveOfficerAndSquad(s, officersMap, officersList, fallbackSlot);
    const psiRank = resolved.rank.includes('PI') && !resolved.rank.includes('PSI') ? 'PSI' : resolved.rank;

    return `• ${dutyType}
નામ: ${resolved.name}
સ્કોડ : ${resolved.squadFormatted}
હોદ્દો: ${psiRank}
મોબાઇલ: ${resolved.phone}`;
  };

  const nextCmDetails = nextRow 
    ? getOffDetails(nextRow.cmMorchoPsi, `CM મોરચો (આગામી તારીખ: ${nextRow.date})`, 'સ્કોડ-૦૮')
    : '';

  return `⭐ ક્રાઇમ બ્રાન્ચ - PSI શ્રી નાઈટ ⭐
📅 તારીખ: ${row.date} (${row.dayName})
━━━━━━━━━━━━━━━━━━━━
${getOffDetails(row.cmMorchoPsi, 'CM મોરચો PSI શ્રી', 'સ્કોડ-૦૯')}

${getOffDetails(row.campusPsi, 'કેમ્પસ નાઈટ PSI શ્રી', 'સ્કોડ-૦૧')}${nextCmDetails ? `\n\n📌 *આગામી તારીખ મોરચો*\n${nextCmDetails}` : ''}
━━━━━━━━━━━━━━━━━━━━
જય હિન્દ! 🇮🇳`;
}
