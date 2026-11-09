import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, Loader2, Save, User } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export default function ProfileSettings() {
  const { profile, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || '',
        department: profile.department || '',
      });
      setIsDirty(false);
    }
  }, [profile]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setIsDirty(true);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleAvatarMockUpload = () => {
    // Allows user to click and update initials preview or note
    setSuccessMsg('Profile picture upload ready for storage integration.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile(formData);
      setIsDirty(false);
      setSuccessMsg('Profile information updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#172033] dark:text-white">Profile Settings</h3>
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            Manage your personal recruiter details and public identity
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar and Initials Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-[#E8EAF1] dark:border-[#1E2448]">
          <div className="relative group">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5935E8] text-lg font-black text-white shadow-md ring-4 ring-[#F0EDFF] dark:ring-[#2A1F5A]">
              {profile?.avatarInitials || 'RS'}
            </div>
            <button
              type="button"
              onClick={handleAvatarMockUpload}
              title="Change profile photo"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold text-[#172033] dark:text-white">
              {profile?.fullName || 'Rohit Sharma'}
            </h4>
            <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
              User ID: <span className="font-mono text-[11px]">{profile?.userId}</span> • {profile?.status}
            </p>
            <button
              type="button"
              onClick={handleAvatarMockUpload}
              className="text-xs font-semibold text-[#5935E8] dark:text-[#A58EFF] hover:underline"
            >
              Change profile photo
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange('fullName')}
              className="input w-full"
              placeholder="e.g. Rohit Sharma"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange('email')}
              className="input w-full"
              placeholder="e.g. rohit.sharma@synthweb.io"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              className="input w-full"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Role / Designation */}
          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5">
              Role / Designation
            </label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={handleChange('role')}
              className="input w-full"
              placeholder="Senior Technical Recruiter"
            />
          </div>

          {/* Department */}
          <div className="sm:col-span-2">
            <label htmlFor="department" className="block text-xs font-semibold text-[#172033] dark:text-white mb-1.5">
              Department / Team
            </label>
            <input
              id="department"
              type="text"
              value={formData.department}
              onChange={handleChange('department')}
              className="input w-full"
              placeholder="Talent Acquisition & HR Operations"
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-[#EBFBF3] dark:bg-[#0E2D1F] p-3 text-xs text-[#16A36A] border border-[#A7F3D0] dark:border-[#16A36A]/30">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#687386] dark:text-[#9AA3B2]">
            {isDirty ? 'Unsaved profile changes.' : 'Profile is up to date.'}
          </span>
          <button
            type="submit"
            disabled={submitting || !isDirty}
            className="btn-primary text-xs py-2 px-4"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{submitting ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

