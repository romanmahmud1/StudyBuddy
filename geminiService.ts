
// Gemini service for providing educational assistance using Google's GenAI API
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Explains a study topic simply in Bengali
export const getStudyExplanation = async (topic: string, base64Image?: string) => {
  const parts: any[] = [];
  if (base64Image) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Image } });
    parts.push({ text: `এই ছবির টপিকটি সহজে বাংলায় ব্যাখ্যা করো। একটি উদাহরণ এবং ছোট গল্প ব্যবহার করো যাতে বুঝতে সুবিধা হয়। বুঝাও যে আমি একদম বেসিক লেভেলে বুঝতে চাই। শুরুতে অবশ্যই "আসসালামু আলাইকুম" বলবে।` });
  } else {
    parts.push({ text: `টপিক: "${topic}"। এই টপিকটি সহজে বাংলায় ব্যাখ্যা করো। একটি উদাহরণ এবং ছোট গল্প ব্যবহার করো যাতে বুঝতে সুবিধা হয়। বুঝাও যে আমি একদম বেসিক লেভেলে বুঝতে চাই। শুরুতে অবশ্যই "আসসালামু আলাইকুম" বলবে।` });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: "You are a friendly teacher. Explain complex concepts in very simple Bengali with stories and examples. MANDATORY: Start every response with the Bengali greeting 'আসসালামু আলাইকুম'. NEVER use 'Namaskar' or any other greeting. Be warm and encouraging."
    }
  });
  return response.text;
};

// Solves a math problem with step-by-step Bengali explanation
export const solveMath = async (mathProblem: string, base64Image?: string) => {
  const parts: any[] = [];
  
  if (base64Image) {
    parts.push({ 
      inlineData: { 
        mimeType: 'image/jpeg', 
        data: base64Image 
      } 
    });
    parts.push({ 
      text: `Solve the math problem in this image. Explain steps clearly in Bengali. Use symbols (+, -, ×, ÷) only. Start with 'আসসালামু আলাইকুম'.` 
    });
  } else {
    parts.push({ 
      text: `Solve this math problem: "${mathProblem}". Explain steps clearly in Bengali. Use symbols (+, -, ×, ÷) only. Start with 'আসসালামু আলাইকুম'.` 
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Switched to Flash for high availability and reliability on Vercel
    contents: { parts },
    config: {
      systemInstruction: "You are 'Math Wizard Master'. Solve problems accurately. STRICT RULES: 1. No LaTeX/delimiters. 2. Use symbols (+, -, ×, ÷) for operations. 3. Explain in simple Bengali. 4. MANDATORY: Start with 'আসসালামু আলাইকুম'."
    }
  });
  return response.text;
};

// Provides translation and pronunciation guide based on direction
export const getTranslationAndGuide = async (text: string, direction: 'bn-en' | 'en-bn') => {
  const prompt = direction === 'bn-en' 
    ? `বাংলা: "${text}"। এর সঠিক ইংরেজি অনুবাদ এবং বাংলা অক্ষরে উচ্চারণ নির্দেশিকা দাও।`
    : `English: "${text}". Provide its correct Bengali translation and pronunciation guide in Bengali letters.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are a language teacher. 
      If translating BN to EN: Return the English sentence and the pronunciation in Bengali letters.
      If translating EN to BN: Return the Bengali sentence and the pronunciation in Bengali letters.
      Format your response strictly as:
      TRANSLATION: [The translated text]
      PRONUNCIATION: [The pronunciation guide in Bengali script]`
    }
  });
  return response.text;
};

// Spelling Correction and Explanation
export const getSpellingCorrection = async (text: string, lang: 'bn' | 'en') => {
  const prompt = lang === 'bn'
    ? `নিচের বাংলা লেখাটির বানান চেক করো: "${text}"। যদি ভুল থাকে তবে সঠিক বানানটি দাও এবং কেন ভুল হয়েছে বা সঠিক নিয়মটি কী তা সহজ বাংলায় বুঝিয়ে বলো। যদি সব সঠিক থাকে তবে "অভিনন্দন, সব সঠিক আছে!" বলো।`
    : `Check the spelling and grammar of this English text: "${text}". If there are errors, provide the corrected version and explain the mistakes in simple Bengali. If everything is correct, say "অভিনন্দন, সব সঠিক আছে!"`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a language expert and spelling teacher. Help students correct their spelling and learn the rules. Always explain in simple Bengali. MANDATORY: Start every response with the Bengali greeting 'আসসালামু আলাইকুম'."
    }
  });
  return response.text;
};

// Generates speech for a given English text
export const getSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// Interactive chat with an AI friend for English practice
export const chatWithAiFriend = async (history: any[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are 'StudyBuddy AI Friend', an expert English tutor who talks like a best friend. 
      - MISSION: Help the student learn English by chatting.
      - GREETING: The first message ever sent by the bot started with 'আসসালামু আলাইকুম'. Never repeat this greeting again.
      - ERROR CORRECTION (CRITICAL): Check every English sentence the user writes.
      - If there is an error: 
        1. Start by saying something like "Oops, a tiny mistake! (ওহ, ছোট একটা ভুল!)" in Bengali.
        2. Explain the mistake clearly in simple Bengali.
        3. Show the correct English sentence.
        4. Then reply to their message in simple English to keep the conversation going.
      - If there is no error:
        1. Praise them briefly (e.g., "Perfect sentence!", "সঠিক হয়েছে!")
        2. Continue the chat in simple English.
      - Use very easy English (A1/A2 level). Do not use complex words.
      - Be extremely encouraging and kind.`
    },
    history: history
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

// General Q&A for educational topics
export const getQA = async (question: string, base64Image?: string) => {
  const parts: any[] = [];
  if (base64Image) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Image } });
    parts.push({ text: `এই ছবিতে থাকা প্রশ্নটির উত্তর দাও। উত্তরটি সহজে বাংলায় বুঝিয়ে দাও। শুরুতে অবশ্যই "আসসালামু আলাইকুম" বলবে।` });
  } else {
    parts.push({ text: `${question}। উত্তর দাও and শুরুতে "আসসালামু আলাইকুম" বলো।` });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: "Answer educational or general knowledge questions simply in Bengali. MANDATORY: Start every response with the Bengali greeting 'আসসালামু আলাইকুম'. NEVER use 'Namaskar' or any other greeting."
    }
  });
  return response.text;
};

// Checks if a daily goal sentence is grammatically acceptable
export const checkDailyGoal = async (input: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Check if this sentence is grammatically correct English: "${input}". If it is correct enough for a beginner, say "SUCCESS". Otherwise, explain the mistake briefly in Bengali.`,
    config: {
      systemInstruction: "You are an English teacher. Evaluate the user's sentence. If it's acceptable for a beginner, output 'SUCCESS'. If not, provide a short correction in Bengali."
    }
  });
  return response.text;
};

// Generates a script (speech, video script, play) based on topic and language
export const getScriptContent = async (topic: string, lang: 'bn' | 'en') => {
  const prompt = lang === 'bn'
    ? `টপিক: "${topic}"। এই টপিকটির ওপর একটি চমৎকার স্ক্রিপ্ট লেখো বাংলা ভাষায়। এটি হতে পারে কোনো বক্তব্য (Speech), ইউটিউব ভিডিওর চিত্রনাট্য (YouTube Script) বা ছোট নাটকের অংশ। খুব সাবলীল ভাষায় এবং আকর্ষণীয়ভাবে লেখো। শুরুতে অবশ্যই "আসসালামু আলাইকুম" বলবে।`
    : `Topic: "${topic}". Write an excellent script on this topic in English. It could be a Speech, a YouTube Video Script, or a Short Play segment. Write it in an engaging and creative way. Start with the Bengali greeting "আসসালামু আলাইকুম" but write the rest in English.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a creative scriptwriter and content creator. You help students write speeches, video scripts, and presentations. Always provide high-quality, structured content. MANDATORY: Start every response with the Bengali greeting 'আসসালামু আলাইকুম'."
    }
  });
  return response.text;
};
