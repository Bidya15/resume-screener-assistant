import { useState } from 'react';
import { Bell, CheckCircle2, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export default function NotificationPreferences() {
  const { preferences, updatePreferences } = useProfile();
  const [savingKey, setSavingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleToggle = async (key) => {
    setSavingKey(key);
    setSuccessMsg(null);
    try {
      const nextVal = !preferences[key];
      await updatePreferences({ [key]: nextVal });
      setSuccessMsg('Notification preferences updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      // fallback
    } finally {
      setSavingKey(null);
    }
  };

  const ITEMS = [
    {
      key: 'emailOnAnalysisComplete',
      icon: Mail,
      title: 'Email on Evaluation Complete',
      desc: 'Receive an automated notification with candidate match score when a resume screening completes.',
    },
    {
      key: 'emailWeeklyDigest',
      icon: Mail,
      title: 'Weekly Recruitment Digest',
      desc: 'Weekly summary email covering total candidate pipeline, average match scores, and hiring benchmarks.',
    },
    {
      key: 'inAppCandidateAlerts',
      icon: Bell,
      title: 'In-App Strong Match Alerts',
      desc: 'Display an immediate notification badge whenever a screened candidate scores ≥ 70%.',
    },
    {
      key: 'inAppSystemUpdates',
      icon: ShieldAlert,
      title: 'AI Model & System Health Alerts',
      desc: 'Notifications regarding Groq engine connectivity, API latency, or system maintenance.',
    },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#172033] dark:text-white">Notification Preferences</h3>
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            Configure which alerts and digests you receive across email and the application
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isChecked = Boolean(preferences?.[item.key]);
          const isSaving = savingKey === item.key;

          return (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] p-4 transition-colors hover:bg-[#F7F8FC]/50 dark:hover:bg-[#161A36]"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8] mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172033] dark:text-white">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed max-w-xl">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={() => handleToggle(item.key)}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5935E8] focus:ring-offset-2 ${
                  isChecked ? 'bg-[#5935E8]' : 'bg-[#E8EAF1] dark:bg-[#2A2F50]'
                }`}
              >
                <span className="sr-only">Toggle {item.title}</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isChecked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {successMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#EBFBF3] dark:bg-[#0E2D1F] p-3 text-xs text-[#16A36A] border border-[#A7F3D0] dark:border-[#16A36A]/30">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}

