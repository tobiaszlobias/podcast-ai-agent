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
  // Používáme gemini-flash-latest, který je v seznamu dostupných modelů
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
  });

  const prompt = `Jsi profesionální rešeršista pro podcasty. Tvým úkolem je připravit podklady pro rozhovor s hostem: ${hostName}.
  
  Použij vyhledávání na internetu a najdi nejaktuálnější informace o tomto člověku (jeho poslední projekty, vyjádření, rozhovory).
  
  Vrať výsledek v JSON formátu s následující strukturou:
  {
    "bio": "Stručný životopis (max 3-4 věty)",
    "currentTopics": ["téma 1", "téma 2", ...],
    "interestingFacts": ["zajímavost 1", "zajímavost 2", ...],
    "suggestedQuestions": ["otázka 1", "otázka 2", ...],
    "potentialControversies": ["pokud existují, jinak prázdné pole"]
  }
  
  DŮLEŽITÉ: Odpovídej VŽDY v češtině. Vrať POUZE čistý JSON objekt bez jakéhokoliv dalšího textu nebo markdownu.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    // Odstranění případných ```json ... ``` obalů
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as ResearchData;
  } catch (error) {
    console.error("Chyba při parsování JSONu od Gemini:", text);
    throw new Error("Nepodařilo se získat strukturovaná data od AI.");
  }
}
