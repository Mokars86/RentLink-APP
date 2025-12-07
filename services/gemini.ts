import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a rental property description based on features.
 */
export const generatePropertyDescription = async (
  features: {
    type: string;
    bedrooms: number;
    location: string;
    highlights: string;
  }
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI services unavailable. Please check API Key.";

  try {
    const prompt = `
      Write a compelling, professional, and attractive rental property description for a 
      ${features.bedrooms}-bedroom ${features.type} located in ${features.location}.
      
      Key highlights to mention: ${features.highlights}.
      
      The tone should be inviting and trustworthy. Keep it under 150 words. 
      Do not include placeholders.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error connecting to AI service.";
  }
};

/**
 * Smart Match: Suggests property types based on a user's vague query.
 * (Used in Search)
 */
export const smartSearchInterpret = async (query: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "";
  
    try {
      const prompt = `
        A user is searching for a rental property with this query: "${query}".
        Extract keywords that match these categories: Apartment, House, Office, Shop, Land.
        Also extract location or price constraints if any.
        Return a very short summary string for a filter label. e.g. "2-bed Apartment in Downtown"
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text || "";
    } catch (error) {
      console.error(error);
      return "";
    }
  };