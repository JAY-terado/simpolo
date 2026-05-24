import { useState } from 'react';
import WelcomePage from './features/welcome/WelcomePage';
import SlipHousePage from './features/video/SlipHousePage';

export default function App() {
  const [profile, setProfile] = useState<{ name: string; phone: string } | null>(() => {
    try {
      const saved = localStorage.getItem('simpolo_user_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
    return null;
  });

  const handleStartTour = (name: string, phone: string) => {
    console.log('Starting experience for:', { name, phone });
    const userSession = { name, phone };
    try {
      localStorage.setItem('simpolo_user_session', JSON.stringify(userSession));
    } catch (e) {
      console.error('Error saving session to localStorage:', e);
    }
    setProfile(userSession);
  };

  const handleBack = () => {
    try {
      localStorage.removeItem('simpolo_user_session');
    } catch (e) {
      console.error('Error clearing session from localStorage:', e);
    }
    setProfile(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#190906] text-white overflow-hidden">
      {!profile ? (
        <WelcomePage onSubmit={handleStartTour} />
      ) : (
        <SlipHousePage userName={profile.name} userPhone={profile.phone} onBack={handleBack} />
      )}
    </div>
  );
}
