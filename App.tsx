
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile, WeeklySchedule } from './types';
import { generateWeeklyPlan } from './services/geminiService';
import { BackendServer } from './services/backend';
import { Loader2, Leaf, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true); // Start loading to check for session
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Check for existing backend session on mount
  useEffect(() => {
    const initSession = async () => {
      const savedUser = BackendServer.loadUser();
      const savedSchedule = BackendServer.loadSchedule();

      if (savedUser && savedSchedule) {
        setProfile(savedUser);
        setSchedule(savedSchedule);
      }
      setLoading(false);
    };
    initSession();
  }, []);

  const handleOnboardingComplete = async (userProfile: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate Backend User Registration
      await BackendServer.saveUser(userProfile);
      
      setProfile(userProfile);
      const generatedSchedule = await generateWeeklyPlan(userProfile);
      
      // Simulate Database Write
      await BackendServer.saveSchedule(generatedSchedule);
      setSchedule(generatedSchedule);
    } catch (err) {
      console.error(err);
      setError("The AI agent encountered a cloud. Let's try to reconnect your vision.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setSyncStatus('syncing');
    setProfile(updatedProfile);
    await BackendServer.saveUser(updatedProfile);
    // Mimic network latency
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const handleUpdateSchedule = async (updatedSchedule: WeeklySchedule) => {
    setSyncStatus('syncing');
    setSchedule(updatedSchedule);
    await BackendServer.saveSchedule(updatedSchedule);
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950 text-stone-200' : 'bg-[#fdfcfb] text-stone-800'}`}>
        <div className="relative">
          <Loader2 className="w-16 h-16 text-[#a3b18a] animate-spin mb-6" />
          <Leaf className={`w-6 h-6 absolute top-5 left-5 ${isDarkMode ? 'text-stone-400' : 'text-[#6b705c]'}`} />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">Accessing Secure Flow...</h2>
        <p className="text-stone-400 max-w-xs text-sm italic">
          Fetching your personalized records from the AI cloud.
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto min-h-screen overflow-x-hidden relative shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950 text-stone-100' : 'bg-[#fdfcfb] text-stone-800'}`}>
      {/* Cloud Sync Indicator */}
      {profile && schedule && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg border transition-all duration-500 ${
            syncStatus === 'syncing' 
              ? 'bg-amber-100/80 border-amber-200 text-amber-700 animate-pulse' 
              : 'bg-white/50 border-white/20 text-stone-500 opacity-0 hover:opacity-100'
          }`}>
            <Cloud className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-bounce' : ''}`} />
            {syncStatus === 'syncing' ? 'Cloud Syncing...' : 'Encrypted & Synced'}
          </div>
        </div>
      )}

      {error ? (
        <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${isDarkMode ? 'bg-neutral-950' : 'bg-[#fdfcfb]'}`}>
          <div className={`${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-100'} p-10 rounded-[2.5rem] shadow-xl max-w-md w-full border`}>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-red-400" />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Connection Halted</h2>
            <p className="text-stone-500 mb-8 text-sm leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#6b705c] text-stone-50 py-4 rounded-2xl font-bold shadow-lg shadow-[#6b705c]/20 hover:bg-[#5a5f4d] transition-all"
            >
              Restart Journey
            </button>
          </div>
        </div>
      ) : (
        !profile || !schedule ? (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
        ) : (
          <Dashboard 
            profile={profile} 
            schedule={schedule} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSchedule={handleUpdateSchedule}
          />
        )
      )}
    </div>
  );
};

export default App;
