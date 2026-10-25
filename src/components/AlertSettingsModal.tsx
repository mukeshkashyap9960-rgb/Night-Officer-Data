import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  Radio, 
  Check, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { AlertConfig } from '../types/roster';
import { alertSound, requestNotificationPermission, showBrowserNotification } from '../utils/audioAlert';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onSaveConfig: (newConfig: AlertConfig) => void;
  onTriggerEmergencyRollCall: () => void;
  lang: 'gu' | 'en';
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerEmergencyRollCall,
  lang,
}) => {
  const [form, setForm] = useState<AlertConfig>(config);
  const [permissionState, setPermissionState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const newVal = !form.soundEnabled;
    setForm({ ...form, soundEnabled: newVal });
    if (newVal) alertSound.playSoftBeep();
  };

  const handleRequestPush = async () => {
    const granted = await requestNotificationPermission();
    setPermissionState(granted ? 'granted' : 'denied');
    setForm({ ...form, browserNotificationsEnabled: granted });
    if (granted) {
      showBrowserNotification(
        'ગુજરાત પોલીસ નાઈટ એલર્ટ',
        'નાઈટ ડ્યુટી એલર્ટ સિસ્ટમ સફળતાપૂર્વક સક્રિય થઈ ગઈ છે.'
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-rose-900 px-5 py-4 text-white flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-950 rounded-lg">
              <Bell className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'gu' ? 'નાઈટ ડ્યુટી એલર્ટ & નોટિફિકેશન સિસ્ટમ' : 'Night Duty Alert & Notification System'}
              </h3>
              <p className="text-xs text-rose-200">
                {lang === 'gu' ? 'સાયરન અવાજ, દૈનિક સમય સૂચના અને બ્રાઉઝર એલર્ટ' : 'Audio siren, shift alarms, and push notifications'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-rose-200 hover:text-white hover:bg-rose-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Audio Chime & Siren */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'gu' ? 'ઓડિયો એલર્ટ સાઉન્ડ (પોલીસ ડિસ્પેચ સાયરન)' : 'Audio Alert Sound'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  form.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    form.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'gu' 
                ? 'નાઈટ શિફ્ટ શરૂ થતા પહેલા અને કોઈ પણ ફેરબદલ વખતે ઓડિયો ચાઇમ વગાડશે.' 
                : 'Plays an audible police dispatch alert before shift start and on roster swaps.'}
            </p>

            {/* Test Audio Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => alertSound.playDispatchChime()}
                className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                🔔 {lang === 'gu' ? 'ડિસ્પેચ ચાઇમ ટેસ્ટ' : 'Test Chime'}
              </button>
              <button
                type="button"
                onClick={() => alertSound.playPoliceSiren()}
                className="px-2.5 py-1 text-xs rounded border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 cursor-pointer"
              >
                🚨 {lang === 'gu' ? 'સાયરન અવાજ ટેસ્ટ' : 'Test Siren'}
              </button>
            </div>
          </div>

          {/* Browser Push Notifications */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'gu' ? 'બ્રાઉઝર પુશ નોટિફિકેશન' : 'Browser Push Notification'}
                </span>
              </div>
              {permissionState === 'granted' ? (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {lang === 'gu' ? 'પરવાનગી છે' : 'Active'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {lang === 'gu' ? 'મંજૂરી આપો' : 'Enable'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'gu'
                ? 'સ્ક્રીન બંધ હોય તો પણ આપના ડિવાઇસ પર નાઈટ ડ્યુટીનું એલર્ટ મળશે.'
                : 'Receive shift alerts on desktop and mobile even when the browser tab is minimized.'}
            </p>
          </div>

          {/* Alert Schedule Time */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'gu' ? 'દૈનિક નાઈટ ડ્યુટી એલર્ટ સમય' : 'Daily Shift Alert Trigger Time'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={form.alertTime}
                onChange={(e) => setForm({ ...form, alertTime: e.target.value })}
                className="px-3 py-1.5 text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'gu' 
                  ? '(૨૦:૦૦ ની શિફ્ટ પહેલાં અધિકારીઓને તૈયાર થવા માટેનો સમય)' 
                  : '(Reminder dispatched prior to 20:00 night shift)'}
              </span>
            </div>
          </div>

          {/* Emergency Roll Call Trigger */}
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{lang === 'gu' ? 'તાત્કાલિક રોલકોલ / સાયરન એલર્ટ' : 'Emergency Night Roll-Call Trigger'}</span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              {lang === 'gu'
                ? 'કંટ્રોલ રૂમ દ્વારા તાત્કાલિક સાયરન વગાડી આજની ડ્યુટીના પાંચેય અધિકારીઓ માટે કટોકટી WhatsApp સૂચના જનરેટ કરો.'
                : 'Sound high-priority siren and generate emergency WhatsApp check-in for tonight.'}
            </p>
            <button
              type="button"
              onClick={() => {
                alertSound.playPoliceSiren();
                onTriggerEmergencyRollCall();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'કટોકટી સાયરન વગાડો & WhatsApp એલર્ટ મોકલો' : 'Sound Siren & Launch Emergency Alert'}</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              {lang === 'gu' ? 'બંધ કરો' : 'Close'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
            >
              {lang === 'gu' ? 'સેટિંગ્સ સાચવો' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
