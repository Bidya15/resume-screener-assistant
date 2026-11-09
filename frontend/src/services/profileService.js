/**
 * User Profile & Account Settings Service
 * Manages recruiter profile, security credentials, and system preferences.
 *
 * BACKEND INTEGRATION NOTE:
 * When Spring Boot security and user management endpoints are provisioned,
 * wire this service to:
 * - GET    /api/user/profile
 * - PUT    /api/user/profile
 * - POST   /api/user/change-password
 * - GET    /api/user/preferences
 * - PUT    /api/user/preferences
 */

const PROFILE_STORAGE_KEY = 'synthweb_user_profile';
const PREFS_STORAGE_KEY = 'synthweb_user_preferences';

const DEFAULT_PROFILE = {
  fullName: 'Rohit Sharma',
  email: 'rohit.sharma@synthweb.io',
  phone: '+91 98765 43210',
  role: 'Senior Technical Recruiter & HR Administrator',
  department: 'Talent Acquisition',
  avatarInitials: 'RS',
  avatarUrl: null,
  userId: 'USR-89214',
  memberSince: 'March 2024',
  status: 'Active Administrator',
};

const DEFAULT_PREFERENCES = {
  emailOnAnalysisComplete: true,
  emailWeeklyDigest: false,
  inAppCandidateAlerts: true,
  inAppSystemUpdates: true,
};

export const profileService = {
  getProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
        return DEFAULT_PROFILE;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  async updateProfile(updates) {
    // Simulate real async network round-trip
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Basic validation
    if (!updates.fullName?.trim()) {
      throw new Error('Full name is required.');
    }
    if (!updates.email?.trim() || !updates.email.includes('@')) {
      throw new Error('A valid email address is required.');
    }

    // Derive avatar initials from full name
    const parts = updates.fullName.trim().split(/\s+/);
    const avatarInitials = parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

    const current = this.getProfile();
    const updated = {
      ...current,
      ...updates,
      avatarInitials,
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!currentPassword) {
      throw new Error('Current password is required.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation do not match.');
    }
    if (currentPassword === newPassword) {
      throw new Error('New password cannot be the same as your current password.');
    }

    // In production, the backend would verify currentPassword against the BCrypt hash.
    return { success: true, message: 'Password successfully changed.' };
  },

  getPreferences() {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
        return DEFAULT_PREFERENCES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  async updatePreferences(updates) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};

