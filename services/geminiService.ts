
import { GoogleGenAI, Type } from "@google/genai";
import { SomalipinProfile, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfileFromImage = async (base64Image: string): Promise<SomalipinProfile> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        {
          text: `
            Waxaad tahay kaaliye xogta u habeeya qaabka 'Somalipin Profile Template'.
            Ka soo saar xogta qofka sawirkan ku jira oo u habeey qaabka JSON ee hoose.
            Fadlan ku qor dhamaan xogta luqadda Af-Soomaaliga.
            
            U door hal category oo ku habboon qofka (tusaale: Ganacsiga, Teknoolajiyadda, iwm).
          `
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          magaca: { type: Type.STRING, description: "Magaca buuxa ee qofka" },
          tagline: { type: Type.STRING, description: "Cinwaanka shaqada ama waxa uu caan ku yahay" },
          category: { type: Type.STRING, description: "Qaybta uu ka tirsan yahay Somalipin" },
          sooyaal: { type: Type.STRING, description: "2-3 jumladood oo kooban oo ku saabsan qofka" },
          guulaha: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Liiska guulaha muhiimka ah"
          },
          xigasho: { type: Type.STRING, description: "Hal xigasho oo dhiirigelin ah" },
          socialProof: { type: Type.STRING, description: "Xaqiijinta halka xogta laga keenay" },
        },
        required: ["magaca", "tagline", "category", "sooyaal", "guulaha", "xigasho", "socialProof"],
      },
    },
  });

  const response = await model;
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

export const translateProfile = async (profile: SomalipinProfile, targetLang: Language): Promise<SomalipinProfile> => {
  const langNames = {
    'en': 'English',
    'ar': 'Arabic (العربية)',
    'zh': 'Chinese (中文)',
    'tr': 'Turkish (Türkçe)',
    'so': 'Somali (Af-Soomaali)'
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following Somalipin profile data from Somali into ${langNames[targetLang]}. 
    Return strictly JSON with the same keys.
    
    Data: ${JSON.stringify(profile)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          magaca: { type: Type.STRING },
          tagline: { type: Type.STRING },
          category: { type: Type.STRING },
          sooyaal: { type: Type.STRING },
          guulaha: { type: Type.ARRAY, items: { type: Type.STRING } },
          xigasho: { type: Type.STRING },
          socialProof: { type: Type.STRING },
        }
      }
    }
  });

  return JSON.parse(response.text.trim());
};
