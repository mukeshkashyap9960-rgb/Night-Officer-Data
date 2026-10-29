export type DutyType = 
  | 'communal_pi' 
  | 'division_pi' 
  | 'cm_morcho_psi' 
  | 'campus_psi' 
  | 'vvip_psi';

export interface DutyRow {
  date: string; // "1/11/2026" or YYYY-MM-DD
  dayName: string; // "રવિવાર"
  dayNameEn: string; // "Sunday"
  communalPi: string; // "PI શ્રી, સ્કોડ-૦૧"
  divisionPi: string; // "PI શ્રી, સ્કોડ-૦૮"
  cmMorchoPsi: string; // "સ્કોડ-૦૯"
  campusPsi: string; // "સ્કોડ-૦૧"
  vvipPsi: string; // "સ્કોડ-૦૬"
  divisionArea?: string; // "ડીવીજન વિસ્તાર e.g. એ-ડીવીઝન પોલીસ સ્ટેશન વિસ્તાર"
  notes?: string;
  attendance?: {
    communalPi?: 'present' | 'absent' | 'leave';
    divisionPi?: 'present' | 'absent' | 'leave';
    cmMorchoPsi?: 'present' | 'absent' | 'leave';
    campusPsi?: 'present' | 'absent' | 'leave';
    vvipPsi?: 'present' | 'absent' | 'leave';
    checkedAt?: string;
  };
}

export interface Officer {
  id: string;
  squad: string; // e.g. "PI શ્રી, સ્કોડ-૦૧" or "સ્કોડ-૦૧"
  category: 'PI' | 'PSI';
  name: string; // officer personal name e.g. "જે. કે. ઝાલા"
  rank: string; // "પોલીસ ઇન્સ્પેક્ટર" or "પોલીસ સબ ઇન્સ્પેક્ટર"
  phone: string; // e.g. "9876543210"
  branch?: string; // e.g. "સાયબર ક્રાઇમ બ્રાન્ચ", "ક્રાઈમ બ્રાન્ચ"
}

export interface DutyShift {
  id: string;
  nameGu: string;
  nameEn: string;
  role: 'PI' | 'PSI';
  badgeColor: string;
  timeRange: string;
}

export interface AlertConfig {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  alertTime: string; // "18:00"
  reminderTemplateGu: string;
  autoAlertEnabled: boolean;
}
