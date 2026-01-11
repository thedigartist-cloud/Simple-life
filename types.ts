
export enum MotivationStyle {
  AFFIRMATION = 'Words of Affirmation',
  AGGRESSIVE = 'Aggressive/Hardcore'
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  motivationStyle: MotivationStyle;
  age: string;
  sex: string;
  ethnicity: string;
  isWorking: boolean;
  workHours?: string;
  isStudying: boolean;
  studyHours?: string;
  goesToGym: boolean;
  hasMedicalAppts: boolean;
  hasSideBusiness: boolean;
  hasKids: boolean;
  hasReligion: boolean;
  avatarColor?: string;
  kidsDetails?: {
    count: number;
    schoolStart: string;
    schoolEnd: string;
    afterSchoolClubs: string;
    homeworkRoutine: string;
    childActivities?: string[];
  };
  religionDetails?: {
    worshipDays: string[];
    prayerTimes: string[];
  };
  alarmSettings?: {
    leadTimeMinutes: number;
  };
}

export interface Task {
  id: string;
  title: string;
  time: string;
  category: 'work' | 'gym' | 'family' | 'personal' | 'medical' | 'meal';
  completed: boolean;
  alarmEnabled?: boolean;
  description?: string;
}

export interface DailyPlan {
  date: string;
  motivationQuote: string;
  tasks: Task[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
}

export interface WeeklySchedule {
  plans: DailyPlan[];
}
