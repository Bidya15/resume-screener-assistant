import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';

/**
 * Enterprise Responsive Application Layout
 * - Desktop collapsible sidebar with middle-edge toggle indicator
 * - Mobile responsive drawer overlay with backdrop blur
 * - Theme-aware background and smooth transitions
 */
export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    return localStorage.getItem('synthweb_sidebar_collapsed') === 'true';
  });

  const { pathname } = useLocation();

  // Close mobile drawer on route navigation and scroll to top
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('synthweb_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0D1B] text-[#172033] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* Desktop Persistent Sidebar (Fixed left) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out ${
          isDesktopCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <Sidebar
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={toggleDesktopCollapse}
        />
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#101329]/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 w-72 shadow-2xl z-10">
            <Sidebar
              isCollapsed={false}
              onNavigate={() => setMobileMenuOpen(false)}
              onClose={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isDesktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onToggleMobileMenu={toggleMobileMenu}
          onToggleDesktopCollapse={toggleDesktopCollapse}
          isSidebarCollapsed={isDesktopCollapsed}
        />

        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

