
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WeeklySchedule, MotivationStyle } from "../types";

export const generateWeeklyPlan = async (profile: UserProfile): Promise<WeeklySchedule> => {
  // Initialize Gemini API with the provided environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const kidsInfo = profile.hasKids 
    ? `${profile.kidsDetails?.count} children. 
       School schedule: Starts at ${profile.kidsDetails?.schoolStart}, Ends at ${profile.kidsDetails?.schoolEnd}. 
       Child activities: ${profile.kidsDetails?.childActivities?.map((a, i) => `Child ${i+1}: ${a}`).join(', ')}.`
    : 'No children';

  const workInfo = profile.isWorking 
    ? `Working. Hours: ${profile.workHours || 'Standard 9-5'}.`
    : 'Not working currently.';

  const studyInfo = profile.isStudying
    ? `Currently studying. Study goal/hours: ${profile.studyHours || 'At least 1-2 hours daily'}.`
    : 'Not currently studying.';

  const religionInfo = profile.hasReligion
    ? `Faith is important. Worship days: ${profile.religionDetails?.worshipDays.join(', ') || 'None specified'}. 
       Daily Prayer/Faith times: ${profile.religionDetails?.prayerTimes.join(', ') || 'None specified'}. 
       Integrate these prayer times into the daily routine strictly.`
    : 'No specific religious requirements.';

  const prompt = `
    Create a detailed 7-day productivity and meal plan for a user with the following profile:
    Name: ${profile.name}
    Motivation Style: ${profile.motivationStyle}
    Age: ${profile.age}, Sex: ${profile.sex}, Ethnicity: ${profile.ethnicity}
    Employment: ${workInfo}
    Education: ${studyInfo}
    GYM: ${profile.goesToGym ? 'Yes, user likes to go to the gym.' : 'No.'}
    Business/Venture: ${profile.hasSideBusiness ? 'Yes, user runs their own business.' : 'No.'}
    Family: ${kidsInfo}
    Religion: ${religionInfo}

    CRITICAL SCHEDULING LOGIC:
    - If the user is at work when their child finishes school (${profile.kidsDetails?.schoolEnd}), you MUST explicitly add a task at that time to address the conflict.
    - If they overlap, generate a task like "Arrange pick up of child" or "Leave work early for school pick up" or "Coordinate child transport". 
    - Factor in travel time if needed.
    - Ensure the user is alerted via these tasks so they aren't surprised by the school day ending while they are in the middle of work.

    Requirements:
    1. A daily schedule from 6 AM to 10 PM.
    2. Specific healthy meal suggestions (breakfast, lunch, dinner, snack) tailored to their profile and ethnicity.
    3. Tasks should include work hours (respecting the range), study hours, family duties, child activities, gym sessions, prayer times, and self-care.
    4. Provide a daily motivation quote based on style (${profile.motivationStyle}).
    5. Ensure the schedule is realistic and minimizes chaos. Return date format as "DayName DayNumber" e.g., "Monday 1".
    6. For all tasks, set "alarmEnabled" to true by default.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                motivationQuote: { type: Type.STRING },
                meals: {
                  type: Type.OBJECT,
                  properties: {
                    breakfast: { type: Type.STRING },
                    lunch: { type: Type.STRING },
                    dinner: { type: Type.STRING },
                    snack: { type: Type.STRING },
                  },
                  required: ["breakfast", "lunch", "dinner", "snack"]
                },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ['work', 'gym', 'family', 'personal', 'medical', 'meal'] },
                      completed: { type: Type.BOOLEAN },
                      alarmEnabled: { type: Type.BOOLEAN },
                      description: { type: Type.STRING }
                    },
                    required: ["id", "title", "time", "category", "completed", "alarmEnabled"]
                  }
                }
              },
              required: ["date", "motivationQuote", "tasks", "meals"]
            }
          }
        },
        required: ["plans"]
      }
    }
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) {
    throw new Error("Failed to receive content from the AI.");
  }

  return JSON.parse(jsonStr) as WeeklySchedule;
};
