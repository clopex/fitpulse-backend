import { sequelize } from '../../config/db';
import { QueryTypes } from 'sequelize';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

const callGemini = async (prompt: string, systemPrompt: string): Promise<string> => {
  const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json() as any;
    throw new Error(err.error?.message || 'Gemini API error');
  }

  const data = await response.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
};

const FITNESS_SYSTEM_PROMPT = `You are FitPulse AI — an expert fitness coach and nutritionist.
You give concise, practical, science-based advice.
Always be encouraging and motivating.
Keep responses focused and actionable.
If asked about medical conditions, always recommend consulting a doctor.`;

export const chatWithAI = async (
  userId: string,
  message: string,
  history: { role: string; content: string }[] = []
) => {
  // Dohvati kontekst korisnika
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

  const reply = await callGemini(fullPrompt, FITNESS_SYSTEM_PROMPT);

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

Format the response as a structured weekly plan with:
- Day name
- Workout title
- List of exercises with sets, reps, and rest time
- Estimated duration
Keep it practical and progressive.`;

  const plan = await callGemini(prompt, FITNESS_SYSTEM_PROMPT);

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
- Weight: ${data.weight_kg}kg
- Height: ${data.height_cm}cm
- Age: ${data.age}
- Activity level: ${data.activity_level}

Include:
1. Daily calorie target
2. Macronutrient split (protein, carbs, fat)
3. Meal timing recommendations
4. Top 5 food recommendations
5. Foods to avoid
Keep it practical and easy to follow.`;

  const advice = await callGemini(prompt, FITNESS_SYSTEM_PROMPT);

  return { advice, data };
};