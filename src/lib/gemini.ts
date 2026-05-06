import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ResearchData {
  bio: string;
  currentTopics: string[];
  interestingFacts: string[];
  suggestedQuestions: string[];
  potentialControversies: string[];
}

export async function generateResearch(hostName: string): Promise<ResearchData> {
  // Používáme stabilnější verzi gemini-1.5-flash
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  });

  const prompt = `Jsi špičkový profesionální rešeršista pro podcasty. Tvým úkolem je připravit detailní a gramaticky naprosto správné podklady pro rozhovor s hostem: ${hostName}.
  
  Použij vyhledávání na internetu a najdi nejaktuálnější informace o tomto člověku (jeho poslední projekty, vyjádření, rozhovory, sociální sítě).
  
  Vrať výsledek v JSON formátu s následující strukturou:
  {
    "bio": "Stručný, ale výstižný životopis (3-4 věty)",
    "currentTopics": ["téma 1", "téma 2", ...],
    "interestingFacts": ["zajímavost 1", "zajímavost 2", ...],
    "suggestedQuestions": ["originální a hluboká otázka 1", "otázka 2", ...],
    "potentialControversies": ["pokud existují (citlivá témata, kritika), jinak prázdné pole"]
  }
  
  DŮLEŽITÉ: 
  - Odpovídej VŽDY v češtině.
  - Používej SPRÁVNOU českou gramatiku a diakritiku (háčky, čárky).
  - Tón by měl být profesionální a inspirativní.
  - Vrať POUZE čistý JSON objekt bez jakéhokoliv dalšího textu nebo markdownu.`;

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson) as ResearchData;
    } catch (error: any) {
      lastError = error;
      // Pokud je to chyba 503 (přetížení), počkáme a zkusíme znovu
      if (error?.status === 503 || error?.message?.includes('503')) {
        console.log(`[AI] Gemini is busy, retrying... (${i + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
