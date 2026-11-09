import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export default function AccountSettings() {
  const { profile, changePassword } = useProfile();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await changePassword(passwords);
      setSuccessMsg(res.message || 'Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#172033] dark:text-white">Account & Security</h3>
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            Manage login credentials and review account security status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Change Password Form */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2] dark:text-[#687386]">
            Change Password
          </h4>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={passwords.currentPassword}
                  onChange={handleChange('currentPassword')}
                  className="input w-full pr-9"
                  placeholder="Enter your existing password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA3B2] hover:text-[#172033] dark:hover:text-white"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={passwords.newPassword}
                  onChange={handleChange('newPassword')}
                  className="input w-full pr-9"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA3B2] hover:text-[#172033] dark:hover:text-white"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={passwords.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className="input w-full"
                placeholder="Re-enter your new password"
              />
            </div>

            {/* Feedback Messages */}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-[#EBFBF3] dark:bg-[#0E2D1F] p-3 text-xs text-[#16A36A] border border-[#A7F3D0] dark:border-[#16A36A]/30">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !passwords.currentPassword || !passwords.newPassword}
              className="btn-primary text-xs py-2 px-4"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              <span>{submitting ? 'Updating…' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Account Meta & Security Details */}
        <div className="lg:col-span-5 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#161A36] p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2] dark:text-[#687386]">
            Account Overview
          </h4>

          <div className="divide-y divide-[#E8EAF1] dark:divide-[#1E2448] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#687386] dark:text-[#9AA3B2]">User ID</span>
              <span className="font-mono text-[11px] font-semibold text-[#172033] dark:text-white">
                {profile?.userId}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#687386] dark:text-[#9AA3B2]">Account Type</span>
              <span className="inline-flex items-center gap-1 rounded bg-[#F0EDFF] dark:bg-[#2A1F5A] px-2 py-0.5 text-[10px] font-bold text-[#5935E8]">
                Administrator
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#687386] dark:text-[#9AA3B2]">Member Since</span>
              <span className="font-medium text-[#172033] dark:text-white">
                {profile?.memberSince}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#687386] dark:text-[#9AA3B2]">Session Status</span>
              <span className="inline-flex items-center gap-1 text-[#16A36A] font-semibold text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" /> Active Session
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

