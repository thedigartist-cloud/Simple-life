
import { UserProfile, WeeklySchedule, Task } from '../types';

/**
 * SIMULATED BACKEND SERVICE
 * Mimics a Node.js/MongoDB infrastructure for demo purposes.
 */

const STORAGE_KEY_PROFILE = 'sync_life_profile_v1';
const STORAGE_KEY_SCHEDULE = 'sync_life_schedule_v1';
const STORAGE_KEY_SESSION = 'sync_life_session_v1';

export class BackendServer {
  /**
   * DATABASE: Simulation of persistent storage
   */
  static async saveUser(profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    console.log('[DB] User Profile updated in persistent storage');
  }

  static async saveSchedule(schedule: WeeklySchedule): Promise<void> {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    console.log('[DB] Weekly Schedule updated in persistent storage');
  }

  static loadUser(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  static loadSchedule(): WeeklySchedule | null {
    const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    return data ? JSON.parse(data) : null;
  }

  /**
   * NOTIFICATION SERVICE: Simulation of Twilio/SendGrid/FCM
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static triggerAlert(title: string, body: string) {
    // In a real backend, this would call Twilio or SendGrid APIs
    console.log(`[ALERT SERVICE] Sending to ${title}: ${body}`);
    
    if (Notification.permission === 'granted') {
      new Notification(`SyncLife: ${title}`, {
        body,
        icon: '/favicon.ico' // Default icon placeholder
      });
    } else {
      // Fallback for demo if permission is not granted
      console.warn('Notifications not permitted. Fallback: SMS Simulation in console.');
    }
  }

  /**
   * BACKGROUND WORKER: Simulates Cron Jobs
   */
  static checkReminders(schedule: WeeklySchedule, leadTime: number = 0) {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // We only check the first day for the demo's simplicity, usually would be a server query
    const todayPlan = schedule.plans[0]; 
    if (!todayPlan) return;

    todayPlan.tasks.forEach(task => {
      if (!task.completed && task.alarmEnabled && task.time === currentTimeStr) {
        this.triggerAlert('Task Reminder', `Don't forget: ${task.title}`);
      }
    });
  }

  /**
   * AUTH: Simulation of session management
   */
  static clearSession() {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    window.location.reload();
  }
}
