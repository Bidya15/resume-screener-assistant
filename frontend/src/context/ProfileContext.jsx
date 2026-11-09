import { createContext, useContext, useState } from 'react';
import { profileService } from '../services/profileService';

const ProfileContext = createContext({
  profile: null,
  preferences: null,
  updateProfile: async () => {},
  changePassword: async () => {},
  updatePreferences: async () => {},
});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => profileService.getProfile());
  const [preferences, setPreferences] = useState(() => profileService.getPreferences());

  const updateProfile = async (updates) => {
    const updated = await profileService.updateProfile(updates);
    setProfile(updated);
    return updated;
  };

  const changePassword = async (payload) => {
    return await profileService.changePassword(payload);
  };

  const updatePreferences = async (updates) => {
    const updated = await profileService.updatePreferences(updates);
    setPreferences(updated);
    return updated;
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        preferences,
        updateProfile,
        changePassword,
        updatePreferences,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

