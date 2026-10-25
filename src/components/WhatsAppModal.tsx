import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { generateDutyWhatsAppUrl, cleanPhoneNumber } from '../utils/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  recipientName: string;
  recipientPhone: string;
  initialMessage: string;
  lang: 'gu' | 'en';
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  title,
  recipientName,
  recipientPhone,
  initialMessage,
  lang,
}) => {
  const [phone, setPhone] = useState(recipientPhone);
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPhone(recipientPhone);
    setMessage(initialMessage);
    setCopied(false);
  }, [recipientPhone, initialMessage, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const waUrl = generateDutyWhatsAppUrl({
    phone: phone || '',
    message,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-800/80 rounded-lg">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {title || (lang === 'gu' ? 'WhatsApp મેસેજ મોકલો' : 'Send WhatsApp Message')}
              </h3>
              <p className="text-xs text-emerald-100">
                {recipientName ? `પ્રાપ્તકર્તા: ${recipientName}` : (lang === 'gu' ? 'ડાયરેક્ટ WhatsApp સેન્ડર' : 'Direct WhatsApp Sender')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Phone input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'gu' ? 'મોબાઇલ નંબર (WhatsApp)' : 'Mobile Number (WhatsApp)'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'gu' 
                ? 'દેશનો કોડ +91 આપમેળે ઉમેરાશે. નંબર બદલી શકો છો.' 
                : 'Country code +91 will be added automatically. You can edit this number.'}
            </p>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'gu' ? 'સંદેશો (સત્તાવાર પોલીસ ફોર્મેટ)' : 'Message (Official Police Format)'}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'gu' ? 'કોપી થયું!' : 'Copied!') : (lang === 'gu' ? 'ટેક્સ્ટ કોપી કરો' : 'Copy Text')}</span>
              </button>
            </div>
            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-sans leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Quick Note about WhatsApp Web / Mobile */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              {lang === 'gu'
                ? 'બટન દબાવતા સીધું જ WhatsApp અથવા WhatsApp Web ખુલશે અને મેસેજ તૈયાર રહેશે. તમારે ફક્ત સેન્ડ (Send) બટન દબાવવાનું રહેશે.'
                : 'Clicking will launch WhatsApp/WhatsApp Web with pre-filled message ready to send.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setTimeout(onClose, 500);
            }}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'gu' ? 'WhatsApp માં મોકલો' : 'Send via WhatsApp'}</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>
        </div>
      </div>
    </div>
  );
};
