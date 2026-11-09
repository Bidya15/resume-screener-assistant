import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  History,
  LayoutDashboard,
  Settings as SettingsIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analysis/new', label: 'New Analysis', icon: FilePlus2 },
  { to: '/analysis/history', label: 'Candidates / History', icon: History },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * Enterprise Dark Navy Sidebar with Middle-Edge Collapse Toggle
 * - Features:
 *   - Clear toggle indicator positioned at the vertical middle of the right border
 *   - Expanded state: icons + text + badges
 *   - Collapsed state: compact icon rail with tooltips
 *   - Live user profile synced with ProfileContext
 *   - Smooth transitions and mobile drawer support
 */
export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  onClose,
}) {
  const { profile } = useProfile();

  const displayName = profile?.fullName || 'Rohit Sharma';
  const displayRole = profile?.role || 'Senior Technical Recruiter';
  const displayInitials = profile?.avatarInitials || 'RS';

  return (
    <div
      className={`relative flex h-full flex-col bg-[#101329] text-[#9AA3B2] border-r border-[#1E2345] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ==================================================================== */}
      {/* VERTICAL MIDDLE TOGGLE BUTTON (Positioned on the Right Border Edge)   */}
      {/* ==================================================================== */}
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
          title={isCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
          className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 h-7 w-7 items-center justify-center rounded-full bg-[#5935E8] text-white shadow-md shadow-indigo-950/50 border-2 border-[#101329] hover:bg-[#4926D6] hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5935E8] focus:ring-offset-2 focus:ring-offset-[#101329]"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Brand Header */}
      <div
        className={`flex h-20 items-center border-b border-[#1E2345] px-4 transition-all ${
          isCollapsed ? 'justify-center' : 'justify-between px-5'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5935E8] text-white shadow-md shadow-indigo-900/30">
            <span className="text-xl font-black tracking-wider">S</span>
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden transition-all duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">Synthweb</span>
                <span className="rounded bg-[#5935E8]/20 px-1 py-0.5 text-[10px] font-bold text-[#A58EFF]">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#687386] truncate">
                Resume Screener
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1B1F3B] hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!isCollapsed && (
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#4E5677]">
            Recruitment
          </div>
        )}

        <nav className="space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl py-3 text-sm font-semibold transition-all duration-150 ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'
                } ${
                  isActive
                    ? 'bg-[#35278C] text-white shadow-sm'
                    : 'text-[#9AA3B2] hover:bg-[#1B1F3B] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#687386] group-hover:text-white'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{label}</span>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-[#5935E8] ring-4 ring-[#35278C]" />
                      )}
                    </>
                  )}

                  {/* Tooltip on Collapsed State */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-[#161A36] border border-[#1E2345] px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block z-50 whitespace-nowrap">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Scoring Engine info callout (expanded only) */}
        {!isCollapsed && (
          <div className="mt-8 rounded-xl border border-[#1E2345] bg-[#161A36] p-4 text-xs text-[#9AA3B2]">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-[#5935E8]" />
              <span>AI Scoring Engine</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#687386]">
              Groq LLM semantic matching with evidence-based criteria.
            </p>
          </div>
        )}
      </div>

      {/* Recruiter User Profile Footer */}
      <div className="border-t border-[#1E2345] p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={`flex items-center rounded-xl p-2 transition-colors hover:bg-[#1B1F3B] ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? `${displayName} (${displayRole})` : 'View Settings'}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Initials Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5935E8] text-xs font-bold text-white ring-2 ring-[#35278C]">
              {displayInitials}
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-[#687386] truncate">{displayRole}</p>
              </div>
            )}
          </div>
        </NavLink>
      </div>
    </div>
  );
}

