
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScript = async (text: string): Promise<{ character: string; text: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: `Разбери этот текст сценария:\n\n${text}` }] }],
      config: {
        systemInstruction: `Ты — эксперт по разбору театральных и киносценариев. 
        Твоя задача: извлечь из текста список реплик.
        Правила:
        1. Определяй имя персонажа (даже если оно не капсом, но стоит перед двоеточием или на отдельной строке).
        2. Очищай текст реплики от технических пометок и длинных авторских ремарок, если они мешают чтению.
        3. Если в тексте есть описания действий без речи, игнорируй их.
        4. Верни массив JSON объектов с полями 'character' и 'text'.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              character: { type: Type.STRING, description: 'Имя персонажа' },
              text: { type: Type.STRING, description: 'Текст реплики' },
            },
            required: ['character', 'text'],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Empty or invalid response from AI");
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
