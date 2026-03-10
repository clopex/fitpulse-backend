import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FITNESS_SYSTEM_PROMPT = `You are FitPulse AI — an expert fitness coach and nutritionist.
You give concise, practical, science-based advice.
Always be encouraging and motivating.
Keep responses focused and actionable.
If asked about medical conditions, always recommend consulting a doctor.`;

const callGemini = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${FITNESS_SYSTEM_PROMPT}\n\n${prompt}`,
  });
  return response.text ?? 'No response';
};

export const chatWithAI = async (
  userId: string,
  message: string,
  history: { role: string; content: string }[] = []
) => {
  const userContext = await sequelize.query(
    `SELECT u.name,
            (SELECT COUNT(*) FROM workout_logs WHERE user_id = $1) as total_workouts,
            (SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status = 'confirmed') as total_bookings,
            s.plan as subscription_plan
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id
     WHERE u.id = $1`,
    { bind: [userId], type: QueryTypes.SELECT }
  ) as any[];

  const user = userContext[0];
  const contextPrompt = user
    ? `User context: Name: ${user.name}, Total workouts: ${user.total_workouts}, Subscription: ${user.subscription_plan ?? 'free'}.`
    : '';

  const fullPrompt = history.length > 0
    ? `${contextPrompt}\n\nConversation history:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nUser: ${message}`
    : `${contextPrompt}\n\nUser: ${message}`;

  const reply = await callGemini(fullPrompt);
  return { reply, message };
};

export const generateWorkoutPlan = async (userId: string, preferences: {
  goal: string;
  level: string;
  days_per_week: number;
  equipment?: string;
}) => {
  const prompt = `Generate a ${preferences.days_per_week}-day per week workout plan for a ${preferences.level} level person.
Goal: ${preferences.goal}.
Equipment available: ${preferences.equipment ?? 'gym equipment'}.
Format as structured weekly plan with day, exercises, sets, reps, rest time and estimated duration.`;

  const plan = await callGemini(prompt);
  return { plan, preferences };
};

export const generateNutritionAdvice = async (data: {
  goal: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  activity_level: string;
}) => {
  const prompt = `Give nutrition advice for:
- Goal: ${data.goal}
- Weight: ${data.weight_kg}kg, Height: ${data.height_cm}cm, Age: ${data.age}
- Activity level: ${data.activity_level}
Include: daily calorie target, macros, meal timing, top 5 foods, foods to avoid.`;

  const advice = await callGemini(prompt);
  return { advice, data };
};