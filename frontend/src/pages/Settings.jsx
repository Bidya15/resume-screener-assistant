import { useState } from 'react';
import {
  Bell,
  Cpu,
  Database,
  Lock,
  Palette,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import ProfileSettings from '../components/settings/ProfileSettings';
import AccountSettings from '../components/settings/AccountSettings';
import NotificationPreferences from '../components/settings/NotificationPreferences';
import AppearanceSettings from '../components/settings/AppearanceSettings';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account & Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance & System', icon: Palette },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8EAF1] dark:border-[#1E2448] overflow-x-auto no-scrollbar gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#5935E8] text-[#5935E8] dark:text-white dark:border-[#5935E8]'
                  : 'border-transparent text-[#687386] dark:text-[#9AA3B2] hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'profile' && <ProfileSettings />}

        {activeTab === 'account' && <AccountSettings />}

        {activeTab === 'notifications' && <NotificationPreferences />}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <AppearanceSettings />

            {/* AI Engine & System Specifications Card */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033] dark:text-white">AI Engine & Platform Architecture</h3>
                  <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">Backend service parameters and database connectivity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#161A36] p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#172033] dark:text-white">
                    <Cpu className="h-4 w-4 text-[#5935E8]" />
                    <span>Inference Provider</span>
                  </div>
                  <p className="text-[#687386] dark:text-[#9AA3B2]">
                    Groq Cloud Acceleration API
                  </p>
                  <p className="font-mono text-[11px] text-[#5935E8] dark:text-[#A58EFF]">
                    Model: openai/gpt-oss-120b (Structured JSON)
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#161A36] p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#172033] dark:text-white">
                    <Database className="h-4 w-4 text-[#3B82F6]" />
                    <span>Database Engine</span>
                  </div>
                  <p className="text-[#687386] dark:text-[#9AA3B2]">
                    PostgreSQL 18.x via Spring Data JPA / Hibernate
                  </p>
                  <p className="font-mono text-[11px] text-[#16A36A]">
                    Database: resume_screener_db (Connected)
                  </p>
                </div>
              </div>
            </div>

            {/* Ethical AI Charter */}
            <div className="card p-6">
              <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBFBF3] dark:bg-[#0E2D1F] text-[#16A36A]">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033] dark:text-white">Ethical AI & Fairness Commitment</h3>
                  <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">Guidelines governing candidate evaluation</p>
                </div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#687386] dark:text-[#9AA3B2]">
                <p>
                  • <strong>No Protected Attributes:</strong> Evaluations never infer, score, or filter candidates based on age, gender, ethnicity, nationality, religion, disability, or marital status.
                </p>
                <p>
                  • <strong>Evidence-Based Grounding:</strong> Every score is calculated directly from demonstrated technical skills, project depth, and verifiable background.
                </p>
                <p>
                  • <strong>Human-in-the-Loop:</strong> AI assessments serve as advisory screening aids. Final hiring decisions rest exclusively with human recruitment teams.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
