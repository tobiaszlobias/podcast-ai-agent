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
  // Seznam modelů k vyzkoušení (od nejrychlejšího po nejrobustnější)
  // Používáme základní aliasy, které jsou nejvíce kompatibilní
  const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-flash"];
  
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

  for (const modelName of modelNames) {
    console.log(`[AI] Trying model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let i = 0; i < 2; i++) { // 2 pokusy pro každý model
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson) as ResearchData;
      } catch (error: any) {
        lastError = error;
        // Pokud je model přetížený (503), zkusíme retry nebo jiný model
        if (error?.status === 503 || error?.message?.includes('503')) {
          console.log(`[AI] Model ${modelName} is busy, retrying... (${i + 1}/2)`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
          continue;
        }
        // Pokud model neexistuje (404), rovnou zkusíme další model v seznamu
        if (error?.status === 404 || error?.message?.includes('404')) {
          console.warn(`[AI] Model ${modelName} not found, switching to next model...`);
          break; 
        }
        throw error;
      }
    }
  }

  throw lastError;
}
