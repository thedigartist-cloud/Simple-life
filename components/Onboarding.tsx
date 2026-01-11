
import React, { useState } from 'react';
import { UserProfile, MotivationStyle } from '../types';
import { User, Mail, Phone, Heart, Zap, Baby, Briefcase, Dumbbell, Globe, Moon, Sun, Clock, BookOpen, Plus, Trash2, GraduationCap } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isDarkMode, toggleDarkMode }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    motivationStyle: MotivationStyle.AFFIRMATION,
    isWorking: false,
    isStudying: false,
    goesToGym: false,
    hasMedicalAppts: false,
    hasSideBusiness: false,
    hasKids: false,
    hasReligion: false,
    kidsDetails: {
      count: 1,
      schoolStart: '08:30',
      schoolEnd: '15:30',
      afterSchoolClubs: '',
      homeworkRoutine: '',
      childActivities: ['']
    },
    religionDetails: {
      worshipDays: [],
      prayerTimes: ['']
    }
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile as UserProfile);
  };

  const inputClasses = `w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent outline-none transition-all ${
    isDarkMode 
      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-stone-600' 
      : 'bg-white border-stone-100 text-stone-800 placeholder-stone-300'
  }`;

  const smallInputClasses = `w-full p-2 border rounded-xl text-xs outline-none transition-all ${
    isDarkMode 
      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-stone-700' 
      : 'bg-white border-stone-100 text-stone-800 placeholder-stone-400'
  }`;

  const handleChildCountChange = (count: number) => {
    const currentActivities = profile.kidsDetails?.childActivities || [];
    const newActivities = Array.from({ length: count }, (_, i) => currentActivities[i] || '');
    setProfile({
      ...profile,
      kidsDetails: {
        ...(profile.kidsDetails || { count: 1, schoolStart: '08:30', schoolEnd: '15:30', afterSchoolClubs: '', homeworkRoutine: '' }),
        count,
        childActivities: newActivities
      }
    });
  };

  const handleChildActivityChange = (index: number, activity: string) => {
    const activities = [...(profile.kidsDetails?.childActivities || [])];
    activities[index] = activity;
    setProfile({
      ...profile,
      kidsDetails: {
        ...(profile.kidsDetails as any),
        childActivities: activities
      }
    });
  };

  const toggleWorshipDay = (day: string) => {
    const currentDays = profile.religionDetails?.worshipDays || [];
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day) 
      : [...currentDays, day];
    setProfile({
      ...profile,
      religionDetails: {
        ...(profile.religionDetails as any),
        worshipDays: newDays
      }
    });
  };

  const addPrayerTime = () => {
    setProfile({
      ...profile,
      religionDetails: {
        ...(profile.religionDetails as any),
        prayerTimes: [...(profile.religionDetails?.prayerTimes || []), '']
      }
    });
  };

  const updatePrayerTime = (index: number, time: string) => {
    const times = [...(profile.religionDetails?.prayerTimes || [])];
    times[index] = time;
    setProfile({
      ...profile,
      religionDetails: {
        ...(profile.religionDetails as any),
        prayerTimes: times
      }
    });
  };

  const removePrayerTime = (index: number) => {
    const times = [...(profile.religionDetails?.prayerTimes || [])];
    times.splice(index, 1);
    setProfile({
      ...profile,
      religionDetails: {
        ...(profile.religionDetails as any),
        prayerTimes: times
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-[#6b705c]'}`}>Begin Your Journey</h2>
            <p className="text-stone-500 text-sm leading-relaxed">Let's ground your daily routine in mindfulness and efficiency.</p>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className={inputClasses}
                  value={profile.name || ''}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className={inputClasses}
                  value={profile.email || ''}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={inputClasses}
                  value={profile.phone || ''}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <button onClick={nextStep} className="w-full bg-[#6b705c] text-stone-50 py-4 rounded-2xl font-bold shadow-lg shadow-[#6b705c]/20 hover:scale-[1.02] active:scale-95 transition-all">
              Next Step
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-[#6b705c]'}`}>Motivation Style</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProfile({...profile, motivationStyle: MotivationStyle.AFFIRMATION})}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  profile.motivationStyle === MotivationStyle.AFFIRMATION 
                    ? isDarkMode ? 'border-[#a3b18a] bg-neutral-900' : 'border-[#a3b18a] bg-[#f7f8f4]' 
                    : isDarkMode ? 'border-neutral-800 bg-neutral-950' : 'border-stone-50 bg-white'
                }`}
              >
                <Heart className={`w-8 h-8 ${profile.motivationStyle === MotivationStyle.AFFIRMATION ? 'text-rose-300 fill-rose-100' : 'text-stone-200'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Kindness</span>
              </button>
              <button
                type="button"
                onClick={() => setProfile({...profile, motivationStyle: MotivationStyle.AGGRESSIVE})}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  profile.motivationStyle === MotivationStyle.AGGRESSIVE 
                    ? isDarkMode ? 'border-[#a3b18a] bg-neutral-900' : 'border-[#a3b18a] bg-[#f7f8f4]' 
                    : isDarkMode ? 'border-neutral-800 bg-neutral-950' : 'border-stone-50 bg-white'
                }`}
              >
                <Zap className={`w-8 h-8 ${profile.motivationStyle === MotivationStyle.AGGRESSIVE ? 'text-amber-400 fill-amber-100' : 'text-stone-200'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Discipline</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Age"
                  className={inputClasses}
                  value={profile.age || ''}
                  onChange={e => setProfile({...profile, age: e.target.value})}
                />
                <select
                  className={inputClasses}
                  value={profile.sex || ''}
                  onChange={e => setProfile({...profile, sex: e.target.value})}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ethnicity (for cultural meals)"
                  className={inputClasses}
                  value={profile.ethnicity || ''}
                  onChange={e => setProfile({...profile, ethnicity: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className={`w-1/3 py-4 rounded-2xl font-bold transition-colors ${isDarkMode ? 'bg-neutral-900 text-stone-500' : 'bg-stone-100 text-stone-400'}`}>Back</button>
              <button onClick={nextStep} className="w-2/3 bg-[#6b705c] text-stone-50 py-4 rounded-2xl font-bold shadow-lg shadow-[#6b705c]/20">Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-[#6b705c]'}`}>Lifestyle Scan</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'isWorking', icon: Briefcase, label: 'Career' },
                { key: 'isStudying', icon: GraduationCap, label: 'Study' },
                { key: 'goesToGym', icon: Dumbbell, label: 'GYM' },
                { key: 'hasSideBusiness', icon: Zap, label: 'Business' },
                { key: 'hasKids', icon: Baby, label: 'Family' },
                { key: 'hasReligion', icon: BookOpen, label: 'Religion' }
              ].map(item => (
                <label key={item.key} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  profile[item.key as keyof typeof profile] 
                    ? isDarkMode ? 'border-[#a3b18a] bg-neutral-900' : 'border-[#a3b18a] bg-[#f7f8f4]' 
                    : isDarkMode ? 'border-neutral-800 bg-neutral-950' : 'border-stone-50 bg-white'
                }`}>
                  <input type="checkbox" className="hidden" checked={!!profile[item.key as keyof typeof profile]} onChange={e => setProfile({...profile, [item.key]: e.target.checked})} />
                  <item.icon className={`w-6 h-6 mb-2 ${profile[item.key as keyof typeof profile] ? 'text-[#a3b18a]' : 'text-stone-300'}`} />
                  <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>{item.label}</span>
                </label>
              ))}
            </div>

            {profile.isWorking && (
              <div className={`p-4 rounded-2xl space-y-2 border animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#a3b18a]" />
                  <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Work Hours</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 9 AM - 5 PM"
                  className={smallInputClasses}
                  value={profile.workHours || ''}
                  onChange={e => setProfile({...profile, workHours: e.target.value})}
                />
              </div>
            )}

            {profile.isStudying && (
              <div className={`p-4 rounded-2xl space-y-2 border animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#a3b18a]" />
                  <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Study Hours</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2 hours daily or 6 PM - 8 PM"
                  className={smallInputClasses}
                  value={profile.studyHours || ''}
                  onChange={e => setProfile({...profile, studyHours: e.target.value})}
                />
              </div>
            )}
            
            {profile.hasKids && (
              <div className={`p-4 rounded-2xl space-y-4 border animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-stone-50 border-stone-100'}`}>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>How many children?</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={smallInputClasses}
                    value={profile.kidsDetails?.count || 1}
                    onChange={e => handleChildCountChange(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-stone-400">School Starts</label>
                    <input
                      type="time"
                      className={smallInputClasses}
                      value={profile.kidsDetails?.schoolStart}
                      onChange={e => setProfile({...profile, kidsDetails: {...(profile.kidsDetails as any), schoolStart: e.target.value}})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-bold text-stone-400">School Ends</label>
                    <input
                      type="time"
                      className={smallInputClasses}
                      value={profile.kidsDetails?.schoolEnd}
                      onChange={e => setProfile({...profile, kidsDetails: {...(profile.kidsDetails as any), schoolEnd: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Child Activities</label>
                  {(profile.kidsDetails?.childActivities || []).map((activity, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[9px] text-stone-400">Child {idx + 1} Activities</span>
                      <input
                        type="text"
                        placeholder="e.g. Piano, Soccer club..."
                        className={smallInputClasses}
                        value={activity}
                        onChange={e => handleChildActivityChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.hasReligion && (
              <div className={`p-4 rounded-2xl space-y-4 border animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-stone-50 border-stone-100'}`}>
                <div>
                  <label className={`text-[10px] font-bold uppercase block mb-3 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Worship Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorshipDay(day)}
                        className={`text-[10px] font-bold py-2 px-3 rounded-xl border transition-all ${
                          profile.religionDetails?.worshipDays.includes(day)
                            ? 'bg-[#a3b18a] text-white border-[#a3b18a]'
                            : isDarkMode ? 'bg-neutral-950 border-neutral-800 text-stone-600' : 'bg-white border-stone-100 text-stone-400'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Prayer Times</label>
                    <button onClick={addPrayerTime} className="p-1 text-[#a3b18a] hover:bg-[#a3b18a]/10 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profile.religionDetails?.prayerTimes.map((time, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="time"
                          className={smallInputClasses}
                          value={time}
                          onChange={e => updatePrayerTime(idx, e.target.value)}
                        />
                        <button onClick={() => removePrayerTime(idx)} className="p-2 text-stone-300 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className={`w-1/3 py-4 rounded-2xl font-bold transition-colors ${isDarkMode ? 'bg-neutral-900 text-stone-500' : 'bg-stone-100 text-stone-400'}`}>Back</button>
              <button onClick={handleSubmit} className="w-2/3 bg-[#6b705c] text-stone-50 py-4 rounded-2xl font-bold shadow-lg shadow-[#6b705c]/20 transition-all hover:bg-[#5a5f4d]">
                Align My Life
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950' : 'bg-[#fdfcfb]'}`}>
      <div className={`max-w-md w-full rounded-[2.5rem] shadow-2xl p-8 border transition-all duration-500 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 shadow-black/50' : 'bg-white border-stone-100 shadow-stone-200/50'}`}>
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex flex-1 gap-3 mr-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#a3b18a]' : isDarkMode ? 'bg-neutral-800' : 'bg-stone-100'}`} />
            ))}
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-neutral-800 text-amber-400' : 'bg-stone-50 text-stone-400'}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
