
import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklySchedule, DailyPlan, Task, MotivationStyle } from '../types';
import { BackendServer } from '../services/backend';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Utensils, 
  Calendar as CalendarIcon, 
  Bell, 
  Settings, 
  Plus, 
  ChevronRight, 
  User, 
  Smile,
  Sun,
  X,
  MinusCircle,
  Moon,
  Trash2,
  Save,
  BellRing,
  BellOff,
  Heart,
  Zap,
  Camera,
  AlertTriangle,
  Share2
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  schedule: WeeklySchedule;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onUpdateSchedule: (updatedSchedule: WeeklySchedule) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, schedule, isDarkMode, toggleDarkMode, onUpdateProfile, onUpdateSchedule }) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);
  
  // Profile editing state
  const [editName, setEditName] = useState(profile.name);
  const [editMotivation, setEditMotivation] = useState(profile.motivationStyle);
  const [editAvatarColor, setEditAvatarColor] = useState(profile.avatarColor || '#a3b18a');

  // Settings
  const [alarmLeadTime, setAlarmLeadTime] = useState(profile.alarmSettings?.leadTimeMinutes || 5);

  // New Task form state
  const [newTask, setNewTask] = useState({ title: '', time: '09:00', category: 'personal' as Task['category'] });

  const currentPlan = localSchedule.plans[currentDayIndex];

  // Simulated "Cron Job" for Reminders
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      BackendServer.checkReminders(localSchedule, profile.alarmSettings?.leadTimeMinutes);
    }, 60000); // Check every minute
    return () => clearInterval(reminderInterval);
  }, [localSchedule, profile.alarmSettings]);

  // Meal editing state
  const [editedMeals, setEditedMeals] = useState(currentPlan.meals);

  // Sync local changes to "Backend"
  useEffect(() => {
    onUpdateSchedule(localSchedule);
  }, [localSchedule]);

  // Sync editedMeals when day changes
  useEffect(() => {
    setEditedMeals(localSchedule.plans[currentDayIndex].meals);
  }, [currentDayIndex, localSchedule]);

  const toggleTask = (taskId: string) => {
    const newPlans = [...localSchedule.plans];
    const day = newPlans[currentDayIndex];
    day.tasks = day.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setLocalSchedule({ ...localSchedule, plans: newPlans });
  };

  const toggleAlarm = (taskId: string) => {
    const newPlans = [...localSchedule.plans];
    const day = newPlans[currentDayIndex];
    day.tasks = day.tasks.map(t => 
      t.id === taskId ? { ...t, alarmEnabled: !t.alarmEnabled } : t
    );
    setLocalSchedule({ ...localSchedule, plans: newPlans });
  };

  const deleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const newPlans = [...localSchedule.plans];
    const day = newPlans[currentDayIndex];
    day.tasks = day.tasks.filter(t => t.id !== taskId);
    setLocalSchedule({ ...localSchedule, plans: newPlans });
  };

  const shareTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const shareText = `SyncLife Task: ${task.title} at ${task.time}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SyncLife Task',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Task details copied to clipboard!');
      } catch (err) {
        console.error('Clipboard error:', err);
        alert('Sharing is not supported on this browser.');
      }
    }
  };

  const addTask = () => {
    if (!newTask.title) return;
    const newPlans = [...localSchedule.plans];
    const day = newPlans[currentDayIndex];
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      time: newTask.time,
      category: newTask.category,
      completed: false,
      alarmEnabled: true
    };
    day.tasks = [...day.tasks, task].sort((a, b) => a.time.localeCompare(b.time));
    setLocalSchedule({ ...localSchedule, plans: newPlans });
    setNewTask({ title: '', time: '09:00', category: 'personal' });
    setShowAddModal(false);
  };

  const saveMeals = () => {
    const newPlans = [...localSchedule.plans];
    newPlans[currentDayIndex].meals = editedMeals;
    setLocalSchedule({ ...localSchedule, plans: newPlans });
    setShowMealModal(false);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: editName,
      motivationStyle: editMotivation,
      avatarColor: editAvatarColor,
      alarmSettings: { leadTimeMinutes: alarmLeadTime }
    });
    setShowProfileModal(false);
  };

  const requestNotifs = async () => {
    const granted = await BackendServer.requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const completedCount = currentPlan.tasks.filter(t => t.completed).length;
  const progress = Math.round(currentPlan.tasks.length > 0 ? (completedCount / currentPlan.tasks.length) * 100 : 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'work': return isDarkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-stone-200 text-stone-700';
      case 'gym': return isDarkMode ? 'bg-orange-900/40 text-orange-200' : 'bg-orange-100 text-orange-700';
      case 'family': return isDarkMode ? 'bg-emerald-900/40 text-emerald-200' : 'bg-sage-100 text-emerald-800';
      case 'meal': return isDarkMode ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-100 text-amber-800';
      default: return isDarkMode ? 'bg-neutral-800 text-stone-400' : 'bg-stone-100 text-stone-500';
    }
  };

  const shortenDay = (dateStr: string) => {
    const day = dateStr.split(' ')[0];
    const map: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thur',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return map[day] || day;
  };

  const modalInputClasses = `w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-[#a3b18a] transition-all ${
    isDarkMode 
      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-stone-700' 
      : 'bg-stone-50 border-stone-100 text-stone-800 placeholder-stone-300'
  }`;

  return (
    <div className={`pb-32 transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950' : 'bg-[#fdfcfb]'}`}>
      {/* Backend Alert Simulation Banner */}
      {notifPermission !== 'granted' && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter">Demo Alerts Disabled</p>
          </div>
          <button 
            onClick={requestNotifs}
            className="text-[9px] font-bold text-white bg-amber-600 px-3 py-1.5 rounded-full hover:bg-amber-700 transition shadow-sm"
          >
            Enable Reminders
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`${isDarkMode ? 'bg-neutral-900' : 'bg-[#4a5d4e]'} text-stone-50 p-6 rounded-b-[2.5rem] shadow-lg relative z-10 transition-colors duration-500`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className={`${isDarkMode ? 'text-stone-500' : 'text-stone-300'} text-sm`}>Peaceful productivity,</p>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAlarmModal(true)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition relative"
            >
              <Bell className="w-5 h-5" />
              {currentPlan.tasks.some(t => t.alarmEnabled) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
              )}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-black/20' : 'bg-white/5'} p-4 rounded-2xl border border-white/10 backdrop-blur-md`}>
          <p className={`italic text-xs mb-1 flex items-center gap-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-300'}`}>
            <Sun className="w-3 h-3" /> Daily Intent
          </p>
          <p className="text-lg font-medium leading-snug tracking-tight italic">"{currentPlan.motivationQuote}"</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="px-6 -mt-6">
        <div className={`${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-stone-100'} rounded-3xl p-5 shadow-sm border flex items-center justify-between transition-colors`}>
          <div className="space-y-1">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Flow Progress</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-[#6b705c]'}`}>{progress}% Synced</p>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative overflow-hidden ${isDarkMode ? 'border-neutral-800 bg-neutral-950' : 'border-stone-100 bg-stone-50'}`}>
             <div 
              className="absolute bottom-0 left-0 w-full bg-[#a3b18a] transition-all duration-700 ease-in-out" 
              style={{ height: `${progress}%` }}
             />
             <span className="relative z-10 text-xs font-bold text-stone-900 mix-blend-difference">
               {completedCount}/{currentPlan.tasks.length}
             </span>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="px-6 mt-8">
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
          {localSchedule.plans.map((plan, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentDayIndex(idx)}
              className={`flex-shrink-0 w-14 py-4 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 ${
                currentDayIndex === idx 
                  ? 'bg-[#a3b18a] text-white shadow-md scale-105' 
                  : isDarkMode 
                    ? 'bg-neutral-900 text-stone-500 border border-neutral-800'
                    : 'bg-stone-50 text-stone-400 border border-stone-100'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tighter">{shortenDay(plan.date)}</span>
              <span className="text-lg font-bold">{plan.date.split(' ')[1] || (idx + 1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-200' : 'text-[#6b705c]'}`}>The Routine</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="text-[#a3b18a] p-2 hover:bg-[#a3b18a]/10 rounded-xl transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {currentPlan.tasks.length === 0 && (
            <div className={`text-center py-10 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-neutral-800 text-stone-600' : 'border-stone-100 text-stone-400'}`}>
              <Plus className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Your flow is open. Add a task.</p>
            </div>
          )}
          {currentPlan.tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 cursor-pointer ${
                task.completed 
                  ? isDarkMode ? 'bg-emerald-900/10 border-emerald-900/20 shadow-inner' : 'bg-[#fefae0] border-[#ccd5ae]/30 shadow-inner'
                  : isDarkMode ? 'bg-neutral-900 border-neutral-800 shadow-sm' : 'bg-white border-stone-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex-shrink-0 relative">
                {task.completed ? (
                  <div className="relative">
                    <CheckCircle2 className="w-6 h-6 text-[#a3b18a]" />
                    <div className="absolute -top-6 -right-1 text-amber-500 animate-pop-in">
                      <Smile className="w-5 h-5 fill-amber-100" />
                    </div>
                  </div>
                ) : (
                  <Circle className={`w-6 h-6 transition-colors ${isDarkMode ? 'text-neutral-700' : 'text-stone-200'}`} />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                  <div className={`flex items-center text-[10px] font-bold ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {task.time}
                  </div>
                  {task.alarmEnabled && (
                    <BellRing className="w-3 h-3 text-red-400 opacity-60" />
                  )}
                </div>
                <h4 className={`font-semibold transition-all duration-300 ${task.completed ? (isDarkMode ? 'text-stone-600' : 'text-stone-400') : (isDarkMode ? 'text-stone-100' : 'text-stone-800')}`}>
                  {task.title}
                </h4>
              </div>
              <div className="flex gap-1 items-center">
                <button 
                  onClick={(e) => shareTask(e, task)}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-neutral-700 hover:text-[#a3b18a]' : 'text-stone-200 hover:text-[#6b705c]'}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => deleteTask(e, task.id)}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-neutral-700 hover:text-red-400' : 'text-stone-200 hover:text-red-400'}`}
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Plan Section */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-stone-200' : 'text-[#6b705c]'}`}>
            <Utensils className="w-5 h-5 text-[#a3b18a]" />
            Nourishment
          </h3>
          <button 
            onClick={() => setShowMealModal(true)}
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${isDarkMode ? 'border-neutral-800 text-stone-500 hover:text-[#a3b18a]' : 'border-stone-100 text-stone-400 hover:text-[#6b705c]'}`}
          >
            Refine
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border border-transparent shadow-sm ${isDarkMode ? 'bg-neutral-900' : 'bg-[#faedcd]'}`}>
            <p className={`text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-amber-500' : 'text-[#bc6c25]'}`}>Morning</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-[#283618]'}`}>{currentPlan.meals.breakfast}</p>
          </div>
          <div className={`p-4 rounded-2xl border border-transparent shadow-sm ${isDarkMode ? 'bg-neutral-900' : 'bg-[#fefae0]'}`}>
            <p className={`text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-emerald-500' : 'text-[#a3b18a]'}`}>Midday</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-[#283618]'}`}>{currentPlan.meals.lunch}</p>
          </div>
          <div className={`p-4 rounded-2xl border border-transparent shadow-sm ${isDarkMode ? 'bg-neutral-900' : 'bg-[#e9edc9]'}`}>
            <p className={`text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-lime-500' : 'text-[#606c38]'}`}>Evening</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-[#283618]'}`}>{currentPlan.meals.dinner}</p>
          </div>
          <div className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-[#fdfcfb] border-stone-100'}`}>
            <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">Refuel</p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{currentPlan.meals.snack}</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={`fixed bottom-6 left-6 right-6 backdrop-blur-xl border shadow-2xl rounded-full h-16 flex items-center justify-around px-4 z-40 transition-colors duration-500 ${isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/80 border-stone-100'}`}>
        <button className={`p-2 rounded-full ${isDarkMode ? 'text-stone-100 bg-neutral-800' : 'text-[#6b705c] bg-[#a3b18a]/20'}`}>
          <CalendarIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-stone-400 hover:text-stone-200 transition">
          <Clock className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-4 bg-[#6b705c] text-white rounded-full -mt-12 shadow-lg shadow-[#6b705c]/30 transition-transform active:scale-90 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowMealModal(true)}
          className={`p-2 transition ${showMealModal ? (isDarkMode ? 'text-[#a3b18a]' : 'text-[#6b705c]') : 'text-stone-400'}`}
        >
          <Utensils className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowProfileModal(true)}
          className={`p-2 transition ${showProfileModal ? (isDarkMode ? 'text-[#a3b18a]' : 'text-[#6b705c]') : 'text-stone-400'}`}
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Your Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-stone-400"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner transition-colors"
                    style={{ backgroundColor: editAvatarColor }}
                  >
                    {editName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {['#a3b18a', '#6b705c', '#bc6c25', '#4a5d4e', '#8d99ae', '#d4a373'].map(color => (
                    <button
                      key={color}
                      onClick={() => setEditAvatarColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${editAvatarColor === color ? 'scale-125 border-stone-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Display Name</label>
                <input 
                  type="text" 
                  className={modalInputClasses}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Motivation Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMotivation(MotivationStyle.AFFIRMATION)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      editMotivation === MotivationStyle.AFFIRMATION 
                        ? isDarkMode ? 'border-[#a3b18a] bg-neutral-900' : 'border-[#a3b18a] bg-[#f7f8f4]' 
                        : isDarkMode ? 'border-neutral-900 bg-neutral-950' : 'border-stone-50 bg-stone-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${editMotivation === MotivationStyle.AFFIRMATION ? 'text-rose-300' : 'text-stone-300'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Kindness</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMotivation(MotivationStyle.AGGRESSIVE)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      editMotivation === MotivationStyle.AGGRESSIVE 
                        ? isDarkMode ? 'border-[#a3b18a] bg-neutral-900' : 'border-[#a3b18a] bg-[#f7f8f4]' 
                        : isDarkMode ? 'border-neutral-900 bg-neutral-950' : 'border-stone-50 bg-stone-50'
                    }`}
                  >
                    <Zap className={`w-5 h-5 ${editMotivation === MotivationStyle.AGGRESSIVE ? 'text-amber-400' : 'text-stone-300'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Discipline</span>
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              className="w-full bg-[#6b705c] text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-[#6b705c]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`w-full max-w-xs rounded-[2.5rem] shadow-2xl p-8 transition-colors duration-500 border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-stone-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5 text-[#a3b18a]" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <span className={`font-medium ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>Dark Mode</span>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-[#a3b18a]' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isDarkMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <button 
                onClick={() => BackendServer.clearSession()}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl font-medium transition-colors ${isDarkMode ? 'bg-neutral-900 text-stone-300 hover:bg-neutral-800' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                Clear All Data
              </button>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full bg-[#6b705c] text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-[#6b705c]/20"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Alarm Settings Modal */}
      {showAlarmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <BellRing className="w-6 h-6 text-[#a3b18a]" />
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Alert Settings</h3>
              </div>
              <button onClick={() => setShowAlarmModal(false)} className="text-stone-400"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Lead Time (Minutes Before)</label>
                <select 
                  className={modalInputClasses}
                  value={alarmLeadTime}
                  onChange={(e) => setAlarmLeadTime(parseInt(e.target.value))}
                >
                  <option value={0}>Exactly on time</option>
                  <option value={5}>5 Minutes Before</option>
                  <option value={10}>10 Minutes Before</option>
                  <option value={15}>15 Minutes Before</option>
                  <option value={30}>30 Minutes Before</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Task Toggles</label>
                {currentPlan.tasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-2xl ${isDarkMode ? 'bg-neutral-900' : 'bg-stone-50'}`}>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold truncate max-w-[150px] ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>{task.title}</span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase">{task.time}</span>
                    </div>
                    <button 
                      onClick={() => toggleAlarm(task.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        task.alarmEnabled 
                          ? 'bg-[#a3b18a] text-white' 
                          : isDarkMode ? 'bg-neutral-950 text-stone-700' : 'bg-white text-stone-300'
                      }`}
                    >
                      {task.alarmEnabled ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setShowAlarmModal(false);
                handleSaveProfile();
              }}
              className="w-full bg-[#6b705c] text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-[#6b705c]/20"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Daily Nourishment</h3>
              <button onClick={() => setShowMealModal(false)} className="text-stone-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Breakfast</label>
                <input 
                  type="text" 
                  className={modalInputClasses}
                  value={editedMeals.breakfast}
                  onChange={(e) => setEditedMeals({...editedMeals, breakfast: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Lunch</label>
                <input 
                  type="text" 
                  className={modalInputClasses}
                  value={editedMeals.lunch}
                  onChange={(e) => setEditedMeals({...editedMeals, lunch: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Dinner</label>
                <input 
                  type="text" 
                  className={modalInputClasses}
                  value={editedMeals.dinner}
                  onChange={(e) => setEditedMeals({...editedMeals, dinner: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Snack</label>
                <input 
                  type="text" 
                  className={modalInputClasses}
                  value={editedMeals.snack}
                  onChange={(e) => setEditedMeals({...editedMeals, snack: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={saveMeals}
              className="w-full bg-[#6b705c] text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-[#6b705c]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Update Menu
            </button>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>Add Routine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Task Title</label>
                <input 
                  type="text" 
                  autoFocus
                  className={modalInputClasses}
                  placeholder="e.g. Meditate for 10 mins"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Time</label>
                  <input 
                    type="time" 
                    className={modalInputClasses}
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Category</label>
                  <select 
                    className={modalInputClasses}
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value as Task['category']})}
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="gym">Gym</option>
                    <option value="family">Family</option>
                    <option value="meal">Meal</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              onClick={addTask}
              className="w-full bg-[#6b705c] text-white py-4 rounded-2xl font-bold mt-8 shadow-lg shadow-[#6b705c]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
