import { Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceSettings() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <Palette className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#172033] dark:text-white">Appearance & Theme</h3>
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            Select your preferred interface theme for optimal viewing comfort
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Light Mode Option */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
            !isDark
              ? 'border-[#5935E8] bg-[#F0EDFF]/30 dark:bg-[#2A1F5A]/30 ring-2 ring-[#5935E8]/30 shadow-sm'
              : 'border-[#E8EAF1] dark:border-[#1E2448] hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mt-0.5">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#172033] dark:text-white">Light Mode</p>
              {!isDark && (
                <span className="rounded bg-[#5935E8] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed">
              Crisp HireAI design with white cards, subtle borders, and high-contrast text.
            </p>
          </div>
        </button>

        {/* Dark Mode Option */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
            isDark
              ? 'border-[#5935E8] bg-[#161A36] ring-2 ring-[#5935E8]/40 shadow-sm'
              : 'border-[#E8EAF1] dark:border-[#1E2448] hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#101329] text-[#5935E8] border border-[#1E2345] mt-0.5">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#172033] dark:text-white">Dark Mode</p>
              {isDark && (
                <span className="rounded bg-[#5935E8] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Active
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed">
              Deep navy and slate palette designed for low-light environments and reduced eye strain.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

