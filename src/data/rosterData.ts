import { DutyRow, Officer } from '../types/roster';

// Exact 14 PI units cycling in the roster
export const PI_UNITS: string[] = [
  'PI શ્રી, સ્કોડ-૦૧',
  'PI શ્રી, સ્કોડ-૦૨',
  'PI શ્રી, સ્કોડ-૦૩',
  'PI શ્રી, સ્કોડ-૦૪',
  'PI શ્રી, સ્કોડ-૦૫',
  'PI શ્રી, સ્કોડ-૦૬',
  'PI શ્રી, સ્કોડ-૦૭',
  'PI શ્રી, સ્કોડ-૦૮',
  'PI શ્રી, સ્કોડ-૦૯',
  'PI શ્રી, સ્કોડ-૧૦',
  'PI સાયબર ક્રાઇમ',
  'PI SOG',
  'PI મહિલા સેલ',
  'PI EOW',
];

// Exact 10 PSI units cycling in the roster
export const PSI_UNITS: string[] = [
  'સ્કોડ-૦૧',
  'સ્કોડ-૦૨',
  'સ્કોડ-૦૩',
  'સ્કોડ-૦૪',
  'સ્કોડ-૦૫',
  'સ્કોડ-૦૬',
  'સ્કોડ-૦૭',
  'સ્કોડ-૦૮',
  'સ્કોડ-૦૯',
  'સ્કોડ-૧૦',
];

// The exact sequence for PSI CM Morcho from image
export const PSI_CM_MORCHO_CYCLE: string[] = [
  'સ્કોડ-૦૯',
  'સ્કોડ-૦૮',
  'સ્કોડ-૦૫',
  'સ્કોડ-૦૧',
  'સ્કોડ-૦૪',
  'સ્કોડ-૧૦',
  'સ્કોડ-૦૭',
  'સ્કોડ-૦૬',
  'સ્કોડ-૦૩',
  'સ્કોડ-૦૨',
];

// The exact sequence for PSI Campus Night from image
export const PSI_CAMPUS_CYCLE: string[] = [
  'સ્કોડ-૦૧',
  'સ્કોડ-૦૪',
  'સ્કોડ-૧૦',
  'સ્કોડ-૦૭',
  'સ્કોડ-૦૬',
  'સ્કોડ-૦૩',
  'સ્કોડ-૦૨',
  'સ્કોડ-૦૯',
  'સ્કોડ-૦૮',
  'સ્કોડ-૦૫',
];

// The exact sequence for PSI VVIP Bandobast from image
export const PSI_VVIP_CYCLE: string[] = [
  'સ્કોડ-૦૬',
  'સ્કોડ-૦૩',
  'સ્કોડ-૦૨',
  'સ્કોડ-૦૯',
  'સ્કોડ-૦૮',
  'સ્કોડ-૦૫',
  'સ્કોડ-૦૧',
  'સ્કોડ-૦૪',
  'સ્કોડ-૧૦',
  'સ્કોડ-૦૭',
];

// Gujarati day names
export const GUJARATI_DAYS = [
  'રવિવાર',
  'સોમવાર',
  'મંગળવાર',
  'બુધવાર',
  'ગુરુવાર',
  'શુક્રવાર',
  'શનિવાર',
];

export const ENGLISH_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Exact 30 rows of November 2026 directly from the provided table image
export const NOVEMBER_2026_ROSTER: DutyRow[] = [
  { date: '1/11/2026', dayName: 'રવિવાર', dayNameEn: 'Sunday', communalPi: 'PI શ્રી, સ્કોડ-૦૧', divisionPi: 'PI શ્રી, સ્કોડ-૦૮', cmMorchoPsi: 'સ્કોડ-૦૯', campusPsi: 'સ્કોડ-૦૧', vvipPsi: 'સ્કોડ-૦૬' },
  { date: '2/11/2026', dayName: 'સોમવાર', dayNameEn: 'Monday', communalPi: 'PI શ્રી, સ્કોડ-૦૨', divisionPi: 'PI શ્રી, સ્કોડ-૦૯', cmMorchoPsi: 'સ્કોડ-૦૮', campusPsi: 'સ્કોડ-૦૪', vvipPsi: 'સ્કોડ-૦૩' },
  { date: '3/11/2026', dayName: 'મંગળવાર', dayNameEn: 'Tuesday', communalPi: 'PI શ્રી, સ્કોડ-૦૩', divisionPi: 'PI શ્રી, સ્કોડ-૧૦', cmMorchoPsi: 'સ્કોડ-૦૫', campusPsi: 'સ્કોડ-૧૦', vvipPsi: 'સ્કોડ-૦૨' },
  { date: '4/11/2026', dayName: 'બુધવાર', dayNameEn: 'Wednesday', communalPi: 'PI શ્રી, સ્કોડ-૦૪', divisionPi: 'PI સાયબર ક્રાઇમ', cmMorchoPsi: 'સ્કોડ-૦૧', campusPsi: 'સ્કોડ-૦૭', vvipPsi: 'સ્કોડ-૦૯' },
  { date: '5/11/2026', dayName: 'ગુરુવાર', dayNameEn: 'Thursday', communalPi: 'PI શ્રી, સ્કોડ-૦૫', divisionPi: 'PI SOG', cmMorchoPsi: 'સ્કોડ-૦૪', campusPsi: 'સ્કોડ-૦૬', vvipPsi: 'સ્કોડ-૦૮' },
  { date: '6/11/2026', dayName: 'શુક્રવાર', dayNameEn: 'Friday', communalPi: 'PI શ્રી, સ્કોડ-૦૬', divisionPi: 'PI મહિલા સેલ', cmMorchoPsi: 'સ્કોડ-૧૦', campusPsi: 'સ્કોડ-૦૩', vvipPsi: 'સ્કોડ-૦૫' },
  { date: '7/11/2026', dayName: 'શનિવાર', dayNameEn: 'Saturday', communalPi: 'PI શ્રી, સ્કોડ-૦૭', divisionPi: 'PI EOW', cmMorchoPsi: 'સ્કોડ-૦૭', campusPsi: 'સ્કોડ-૦૨', vvipPsi: 'સ્કોડ-૦૧' },
  { date: '8/11/2026', dayName: 'રવિવાર', dayNameEn: 'Sunday', communalPi: 'PI શ્રી, સ્કોડ-૦૮', divisionPi: 'PI શ્રી, સ્કોડ-૦૧', cmMorchoPsi: 'સ્કોડ-૦૬', campusPsi: 'સ્કોડ-૦૯', vvipPsi: 'સ્કોડ-૦૪' },
  { date: '9/11/2026', dayName: 'સોમવાર', dayNameEn: 'Monday', communalPi: 'PI શ્રી, સ્કોડ-૦૯', divisionPi: 'PI શ્રી, સ્કોડ-૦૨', cmMorchoPsi: 'સ્કોડ-૦૩', campusPsi: 'સ્કોડ-૦૮', vvipPsi: 'સ્કોડ-૧૦' },
  { date: '10/11/2026', dayName: 'મંગળવાર', dayNameEn: 'Tuesday', communalPi: 'PI શ્રી, સ્કોડ-૧૦', divisionPi: 'PI શ્રી, સ્કોડ-૦૩', cmMorchoPsi: 'સ્કોડ-૦૨', campusPsi: 'સ્કોડ-૦૫', vvipPsi: 'સ્કોડ-૦૭' },
  { date: '11/11/2026', dayName: 'બુધવાર', dayNameEn: 'Wednesday', communalPi: 'PI સાયબર ક્રાઇમ', divisionPi: 'PI શ્રી, સ્કોડ-૦૪', cmMorchoPsi: 'સ્કોડ-૦૯', campusPsi: 'સ્કોડ-૦૧', vvipPsi: 'સ્કોડ-૦૬' },
  { date: '12/11/2026', dayName: 'ગુરુવાર', dayNameEn: 'Thursday', communalPi: 'PI SOG', divisionPi: 'PI શ્રી, સ્કોડ-૦૫', cmMorchoPsi: 'સ્કોડ-૦૮', campusPsi: 'સ્કોડ-૦૪', vvipPsi: 'સ્કોડ-૦૩' },
  { date: '13/11/2026', dayName: 'શુક્રવાર', dayNameEn: 'Friday', communalPi: 'PI મહિલા સેલ', divisionPi: 'PI શ્રી, સ્કોડ-૦૬', cmMorchoPsi: 'સ્કોડ-૦૫', campusPsi: 'સ્કોડ-૧૦', vvipPsi: 'સ્કોડ-૦૨' },
  { date: '14/11/2026', dayName: 'શનિવાર', dayNameEn: 'Saturday', communalPi: 'PI EOW', divisionPi: 'PI શ્રી, સ્કોડ-૦૭', cmMorchoPsi: 'સ્કોડ-૦૧', campusPsi: 'સ્કોડ-૦૭', vvipPsi: 'સ્કોડ-૦૯' },
  { date: '15/11/2026', dayName: 'રવિવાર', dayNameEn: 'Sunday', communalPi: 'PI શ્રી, સ્કોડ-૦૧', divisionPi: 'PI શ્રી, સ્કોડ-૦૮', cmMorchoPsi: 'સ્કોડ-૦૪', campusPsi: 'સ્કોડ-૦૬', vvipPsi: 'સ્કોડ-૦૮' },
  { date: '16/11/2026', dayName: 'સોમવાર', dayNameEn: 'Monday', communalPi: 'PI શ્રી, સ્કોડ-૦૨', divisionPi: 'PI શ્રી, સ્કોડ-૦૯', cmMorchoPsi: 'સ્કોડ-૧૦', campusPsi: 'સ્કોડ-૦૩', vvipPsi: 'સ્કોડ-૦૫' },
  { date: '17/11/2026', dayName: 'મંગળવાર', dayNameEn: 'Tuesday', communalPi: 'PI શ્રી, સ્કોડ-૦૩', divisionPi: 'PI શ્રી, સ્કોડ-૧૦', cmMorchoPsi: 'સ્કોડ-૦૭', campusPsi: 'સ્કોડ-૦૨', vvipPsi: 'સ્કોડ-૦૧' },
  { date: '18/11/2026', dayName: 'બુધવાર', dayNameEn: 'Wednesday', communalPi: 'PI શ્રી, સ્કોડ-૦૪', divisionPi: 'PI સાયબર ક્રાઇમ', cmMorchoPsi: 'સ્કોડ-૦૬', campusPsi: 'સ્કોડ-૦૯', vvipPsi: 'સ્કોડ-૦૪' },
  { date: '19/11/2026', dayName: 'ગુરુવાર', dayNameEn: 'Thursday', communalPi: 'PI શ્રી, સ્કોડ-૦૫', divisionPi: 'PI SOG', cmMorchoPsi: 'સ્કોડ-૦૩', campusPsi: 'સ્કોડ-૦૮', vvipPsi: 'સ્કોડ-૧૦' },
  { date: '20/11/2026', dayName: 'શુક્રવાર', dayNameEn: 'Friday', communalPi: 'PI શ્રી, સ્કોડ-૦૬', divisionPi: 'PI મહિલા સેલ', cmMorchoPsi: 'સ્કોડ-૦૨', campusPsi: 'સ્કોડ-૦૫', vvipPsi: 'સ્કોડ-૦૭' },
  { date: '21/11/2026', dayName: 'શનિવાર', dayNameEn: 'Saturday', communalPi: 'PI શ્રી, સ્કોડ-૦૭', divisionPi: 'PI EOW', cmMorchoPsi: 'સ્કોડ-૦૯', campusPsi: 'સ્કોડ-૦૧', vvipPsi: 'સ્કોડ-૦૬' },
  { date: '22/11/2026', dayName: 'રવિવાર', dayNameEn: 'Sunday', communalPi: 'PI શ્રી, સ્કોડ-૦૮', divisionPi: 'PI શ્રી, સ્કોડ-૦૧', cmMorchoPsi: 'સ્કોડ-૦૮', campusPsi: 'સ્કોડ-૦૪', vvipPsi: 'સ્કોડ-૦૩' },
  { date: '23/11/2026', dayName: 'સોમવાર', dayNameEn: 'Monday', communalPi: 'PI શ્રી, સ્કોડ-૦૯', divisionPi: 'PI શ્રી, સ્કોડ-૦૨', cmMorchoPsi: 'સ્કોડ-૦૫', campusPsi: 'સ્કોડ-૧૦', vvipPsi: 'સ્કોડ-૦૨' },
  { date: '24/11/2026', dayName: 'મંગળવાર', dayNameEn: 'Tuesday', communalPi: 'PI શ્રી, સ્કોડ-૧૦', divisionPi: 'PI શ્રી, સ્કોડ-૦૩', cmMorchoPsi: 'સ્કોડ-૦૧', campusPsi: 'સ્કોડ-૦૭', vvipPsi: 'સ્કોડ-૦૯' },
  { date: '25/11/2026', dayName: 'બુધવાર', dayNameEn: 'Wednesday', communalPi: 'PI સાયબર ક્રાઇમ', divisionPi: 'PI શ્રી, સ્કોડ-૦૪', cmMorchoPsi: 'સ્કોડ-૦૪', campusPsi: 'સ્કોડ-૦૬', vvipPsi: 'સ્કોડ-૦૮' },
  { date: '26/11/2026', dayName: 'ગુરુવાર', dayNameEn: 'Thursday', communalPi: 'PI SOG', divisionPi: 'PI શ્રી, સ્કોડ-૦૫', cmMorchoPsi: 'સ્કોડ-૧૦', campusPsi: 'સ્કોડ-૦૩', vvipPsi: 'સ્કોડ-૦૫' },
  { date: '27/11/2026', dayName: 'શુક્રવાર', dayNameEn: 'Friday', communalPi: 'PI મહિલા સેલ', divisionPi: 'PI શ્રી, સ્કોડ-૦૬', cmMorchoPsi: 'સ્કોડ-૦૭', campusPsi: 'સ્કોડ-૦૨', vvipPsi: 'સ્કોડ-૦૧' },
  { date: '28/11/2026', dayName: 'શનિવાર', dayNameEn: 'Saturday', communalPi: 'PI EOW', divisionPi: 'PI શ્રી, સ્કોડ-૦૭', cmMorchoPsi: 'સ્કોડ-૦૬', campusPsi: 'સ્કોડ-૦૯', vvipPsi: 'સ્કોડ-૦૪' },
  { date: '29/11/2026', dayName: 'રવિવાર', dayNameEn: 'Sunday', communalPi: 'PI શ્રી, સ્કોડ-૦૧', divisionPi: 'PI શ્રી, સ્કોડ-૦૮', cmMorchoPsi: 'સ્કોડ-૦૩', campusPsi: 'સ્કોડ-૦૮', vvipPsi: 'સ્કોડ-૧૦' },
  { date: '30/11/2026', dayName: 'સોમવાર', dayNameEn: 'Monday', communalPi: 'PI શ્રી, સ્કોડ-૦૨', divisionPi: 'PI શ્રી, સ્કોડ-૦૯', cmMorchoPsi: 'સ્કોડ-૦૨', campusPsi: 'સ્કોડ-૦૫', vvipPsi: 'સ્કોડ-૦૭' },
];

// Initial officer directory
export const DEFAULT_OFFICERS: Officer[] = [
  { id: 'pi-1', squad: 'PI શ્રી, સ્કોડ-૦૧', category: 'PI', name: 'શ્રી આર. કે. જાડેજા', rank: 'PI', phone: '9825011001', branch: 'સ્કોડ-૧' },
  { id: 'pi-2', squad: 'PI શ્રી, સ્કોડ-૦૨', category: 'PI', name: 'શ્રી એમ. એન. પટેલ', rank: 'PI', phone: '9825011002', branch: 'સ્કોડ-૨' },
  { id: 'pi-3', squad: 'PI શ્રી, સ્કોડ-૦૩', category: 'PI', name: 'શ્રી આઇ. એન. ઘાસુરા', rank: 'PI', phone: '8200752448', branch: 'સ્કોડ-૩' },
  { id: 'pi-4', squad: 'PI શ્રી, સ્કોડ-૦૪', category: 'PI', name: 'શ્રી એ. પી. જેબલીયા', rank: 'PI', phone: '9898298984', branch: 'સ્કોડ-૪' },
  { id: 'pi-5', squad: 'PI શ્રી, સ્કોડ-૦૫', category: 'PI', name: 'શ્રી પી. એમ. ધાખડા', rank: 'PI', phone: '9275000019', branch: 'સ્કોડ-૫' },
  { id: 'pi-6', squad: 'PI શ્રી, સ્કોડ-૦૬', category: 'PI', name: 'શ્રી એચ. આર. રાઠોડ', rank: 'PI', phone: '9825011006', branch: 'સ્કોડ-૬' },
  { id: 'pi-7', squad: 'PI શ્રી, સ્કોડ-૦૭', category: 'PI', name: 'શ્રી ડી. કે. વાઘેલા', rank: 'PI', phone: '9825011007', branch: 'સ્કોડ-૭' },
  { id: 'pi-8', squad: 'PI શ્રી, સ્કોડ-૦૮', category: 'PI', name: 'શ્રી પી. એન. પરમાર', rank: 'PI', phone: '9825011008', branch: 'સ્કોડ-૮' },
  { id: 'pi-9', squad: 'PI શ્રી, સ્કોડ-૦૯', category: 'PI', name: 'શ્રી બી. એસ. રાવલ', rank: 'PI', phone: '9825011009', branch: 'સ્કોડ-૯' },
  { id: 'pi-10', squad: 'PI શ્રી, સ્કોડ-૧૦', category: 'PI', name: 'શ્રી કે. એમ. દેસાઈ', rank: 'PI', phone: '9825011010', branch: 'સ્કોડ-૧૦' },
  { id: 'pi-11', squad: 'PI સાયબર ક્રાઇમ', category: 'PI', name: 'શ્રી એ. પી. ત્રિવેદી', rank: 'PI', phone: '9825011011', branch: 'સાયબર ક્રાઇમ બ્રાન્ચ' },
  { id: 'pi-12', squad: 'PI SOG', category: 'PI', name: 'શ્રી ટી. જી. પટેલ', rank: 'PI', phone: '9825011012', branch: 'સ્પેશિયલ ઓપરેશન્સ ગ્રુપ' },
  { id: 'pi-13', squad: 'PI મહિલા સેલ', category: 'PI', name: 'શ્રીમતી એન. એસ. ચાવડા', rank: 'PI', phone: '9825011013', branch: 'મહિલા પોલીસ સેલ' },
  { id: 'pi-14', squad: 'PI EOW', category: 'PI', name: 'શ્રી વાય. ડી. જોશી', rank: 'PI', phone: '9825011014', branch: 'ઇકોનોમિક ઓફેન્સ વિંગ' },

  // PSI Squads
  { id: 'psi-1', squad: 'સ્કોડ-૦૧', category: 'PSI', name: 'શ્રી કે. ડી. બારિયા', rank: 'PSI', phone: '9825022001', branch: 'પીએસઆઈ સ્કોડ-૧' },
  { id: 'psi-2', squad: 'સ્કોડ-૦૨', category: 'PSI', name: 'શ્રી એચ. કે. મકવાણા', rank: 'PSI', phone: '9825022002', branch: 'પીએસઆઈ સ્કોડ-૨' },
  { id: 'psi-3', squad: 'સ્કોડ-૦૩', category: 'PSI', name: 'શ્રી વી. આર. પ્રજાપતિ', rank: 'PSI', phone: '9825022003', branch: 'પીએસઆઈ સ્કોડ-૩' },
  { id: 'psi-4', squad: 'સ્કોડ-૦૪', category: 'PSI', name: 'શ્રી આર. બી. ઠાકોર', rank: 'PSI', phone: '9825022004', branch: 'પીએસઆઈ સ્કોડ-૪' },
  { id: 'psi-5', squad: 'સ્કોડ-૦૫', category: 'PSI', name: 'શ્રી સી. એમ. વણકર', rank: 'PSI', phone: '9825022005', branch: 'પીએસઆઈ સ્કોડ-૫' },
  { id: 'psi-6', squad: 'સ્કોડ-૦૬', category: 'PSI', name: 'શ્રી જે. ટી. ચૌહાણ', rank: 'PSI', phone: '9825022006', branch: 'પીએસઆઈ સ્કોડ-૬' },
  { id: 'psi-7', squad: 'સ્કોડ-૦૭', category: 'PSI', name: 'શ્રી ડી. એસ. ભોઈ', rank: 'PSI', phone: '9825022007', branch: 'પીએસઆઈ સ્કોડ-૭' },
  { id: 'psi-8', squad: 'સ્કોડ-૦૮', category: 'PSI', name: 'શ્રી કે. એલ. ગઢવી', rank: 'PSI', phone: '9825022008', branch: 'પીએસઆઈ સ્કોડ-૮' },
  { id: 'psi-9', squad: 'સ્કોડ-૦૯', category: 'PSI', name: 'શ્રી પી. બી. રબારી', rank: 'PSI', phone: '9825022009', branch: 'પીએસઆઈ સ્કોડ-૯' },
  { id: 'psi-10', squad: 'સ્કોડ-૧૦', category: 'PSI', name: 'શ્રી એસ. એન. પંડ્યા', rank: 'PSI', phone: '9825022010', branch: 'પીએસઆઈ સ્કોડ-૧૦' },
];

export const DUTY_COLUMNS = [
  { id: 'communalPi', labelGu: 'કોમ્યુનલ નાઈટ (PI)', labelEn: 'Communal Night (PI)', role: 'PI', color: 'blue' },
  { id: 'divisionPi', labelGu: 'ડીવીઝન નાઈટ (PI)', labelEn: 'Division Night (PI)', role: 'PI', color: 'indigo' },
  { id: 'cmMorchoPsi', labelGu: 'CM મોરચો (PSI)', labelEn: 'CM Morcho (PSI)', role: 'PSI', color: 'amber' },
  { id: 'campusPsi', labelGu: 'કેમ્પસ નાઈટ (PSI)', labelEn: 'Campus Night (PSI)', role: 'PSI', color: 'emerald' },
  { id: 'vvipPsi', labelGu: 'VVIP બંદોબસ્ત (PSI)', labelEn: 'VVIP Bandobast (PSI)', role: 'PSI', color: 'rose' },
] as const;

// Helper to compute cyclic roster for any given date
export function generateDayRoster(dateObj: Date): DutyRow {
  // Base anchor: 1 Nov 2026 (day index 0)
  const baseDate = new Date(2026, 10, 1); // 1 Nov 2026
  const diffTime = dateObj.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dayOfWeek = dateObj.getDay();
  const dayName = GUJARATI_DAYS[dayOfWeek];
  const dayNameEn = ENGLISH_DAYS[dayOfWeek];
  const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  // Positive modulo
  const mod14 = ((diffDays % 14) + 14) % 14;
  const mod10 = ((diffDays % 10) + 10) % 10;

  // Communal PI starts at 0
  const communalPi = PI_UNITS[mod14];
  // Division PI starts at 7
  const divisionPi = PI_UNITS[(mod14 + 7) % 14];

  // PSI cycles
  const cmMorchoPsi = PSI_CM_MORCHO_CYCLE[mod10];
  const campusPsi = PSI_CAMPUS_CYCLE[mod10];
  const vvipPsi = PSI_VVIP_CYCLE[mod10];

  return {
    date: dateStr,
    dayName,
    dayNameEn,
    communalPi,
    divisionPi,
    cmMorchoPsi,
    campusPsi,
    vvipPsi,
  };
}

export function generateMonthRoster(year: number, month: number): DutyRow[] {
  // If year is 2026 and month is 10 (November), return exact table
  if (year === 2026 && month === 10) {
    return [...NOVEMBER_2026_ROSTER];
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows: DutyRow[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    rows.push(generateDayRoster(new Date(year, month, d)));
  }
  return rows;
}

export function generateYearRoster(year: number): DutyRow[] {
  const allRows: DutyRow[] = [];
  for (let m = 0; m < 12; m++) {
    const monthRows = generateMonthRoster(year, m);
    allRows.push(...monthRows);
  }
  return allRows;
}
