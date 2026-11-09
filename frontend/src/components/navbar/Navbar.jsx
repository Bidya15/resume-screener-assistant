import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Plus,
  Share2,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import ShareMatchModal from '../ShareMatchModal';

const PAGE_METADATA = [
  { match: (p) => p === '/' || p === '/dashboard', title: 'Dashboard', subtitle: 'Overview of candidate screenings and recruitment insights' },
  { match: (p) => p === '/analysis/new' || p === '/analyses/new', title: 'New Resume Analysis', subtitle: 'Compare candidate qualifications against job requirements' },
  { match: (p) => p === '/analysis/history' || p === '/analyses', title: 'Candidates & History', subtitle: 'Review, search and filter previously screened profiles' },
  { match: (p) => p === '/settings', title: 'Settings', subtitle: 'Application preferences and recruiter profile management' },
  { match: (p) => p.startsWith('/analysis/') || p.startsWith('/analyses/'), title: 'Semantic JD Matching', subtitle: 'Comprehensive AI match evaluation and candidate breakdown' },
];

export default function Navbar({
  onToggleMobileMenu,
  onToggleDesktopCollapse,
  isSidebarCollapsed,
}) {
  const { pathname } = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const { unreadCount } = useNotifications();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const current = PAGE_METADATA.find((m) => m.match(pathname)) || {
    title: 'Resume Screener',
    subtitle: '',
  };

  const isDetailsPage = pathname.startsWith('/analysis/') || pathname.startsWith('/analyses/');
  const isNewPage = pathname === '/analysis/new' || pathname === '/analyses/new';

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#E8EAF1] dark:border-[#1E2448] bg-white/95 dark:bg-[#101329]/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Toggle & Titles */}
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="Toggle mobile sidebar"
              className="rounded-lg p-2 text-[#687386] hover:bg-[#F7F8FC] dark:text-[#9AA3B2] dark:hover:bg-[#1B1F3B] hover:text-[#172033] dark:hover:text-white lg:hidden transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              {/* Breadcrumbs for Details View */}
              {isDetailsPage && (
                <div className="mb-1 flex items-center gap-1.5 text-xs text-[#687386] dark:text-[#9AA3B2]">
                  <Link
                    to="/analysis/history"
                    className="hover:text-[#5935E8] flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> Candidates
                  </Link>
                  <ChevronRight className="h-3 w-3 text-[#9AA3B2]" />
                  <span className="font-medium text-[#172033] dark:text-white">Match Details</span>
                </div>
              )}
              <h1 className="text-xl font-bold tracking-tight text-[#172033] dark:text-white">
                {current.title}
              </h1>
              {current.subtitle && (
                <p className="hidden text-xs text-[#687386] dark:text-[#9AA3B2] sm:block">
                  {current.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-1.5 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#161A36] px-3 py-2 text-xs font-semibold text-[#172033] dark:text-white shadow-sm hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-[#E6A23C]" />
                  <span className="hidden md:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#5935E8]" />
                  <span className="hidden md:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Details Page Share Match Button */}
            {isDetailsPage && (
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm"
                title="Share candidate match details"
              >
                <Share2 className="h-4 w-4 text-[#5935E8]" />
                <span className="hidden sm:inline">Share Match</span>
              </button>
            )}

            {/* New Analysis Action Button */}
            {!isNewPage && (
              <Link to="/analysis/new" className="btn-primary text-xs py-2 px-3 sm:px-4">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Analysis</span>
              </Link>
            )}

            {/* Notification Bell Dropdown Container */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
                aria-label={`Notifications, ${unreadCount} unread`}
                className={`relative rounded-lg p-2 text-[#687386] hover:bg-[#F7F8FC] dark:text-[#9AA3B2] dark:hover:bg-[#1B1F3B] hover:text-[#172033] dark:hover:text-white transition-colors ${
                  notificationsOpen ? 'bg-[#F0EDFF] text-[#5935E8] dark:bg-[#2A1F5A]' : ''
                }`}
                title="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5935E8] px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#101329]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Share Match Modal */}
      <ShareMatchModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        candidateName={document.title.includes('—') ? document.title.split('—')[1]?.trim() : 'Candidate'}
      />
    </>
  );
}

