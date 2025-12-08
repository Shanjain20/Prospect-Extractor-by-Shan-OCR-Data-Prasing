import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Prospect } from "../types";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as per the environment requirement.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROSPECT_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      Name: { type: Type.STRING, description: "Full name of the prospect" },
      PhoneNumber: { type: Type.STRING, description: "Phone number starting with 013, 014, 015, 016, 017, 018, or 019" },
      Company: { type: Type.STRING, description: "Company or organization name" },
      Email: { type: Type.STRING, description: "Email address" },
      Address: { type: Type.STRING, description: "Full physical address including city/state" },
    },
    required: ["Name"], // At least name should be present to be a valid entry
  },
};

export const extractDataFromImage = async (
  base64Image: string,
  mimeType: string
): Promise<Prospect[]> => {
  try {
    const modelId = "gemini-2.5-flash"; // Best for multimodal OCR speed/cost

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `You are an expert OCR and data extraction assistant. 
            Analyze this image of a contact list or book page. 
            Extract prospect information into a structured JSON format.
            
            Fields to extract:
            - Name
            - Phone Number
            - Company
            - Email
            - Address
            
            Rules:
            1. If a field is missing, leave it as an empty string.
            2. Fix obvious OCR typos.
            3. **PHONE NUMBER VALIDATION**: Only extract phone numbers that start with the following prefixes: 017, 018, 019, 016, 013, 014, 015. 
               - Format them as continuous digits (e.g., 01712345678).
               - If a number does not start with these prefixes, leave the field empty.
            4. Ignore headers, footers, or irrelevant page numbers.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PROSPECT_SCHEMA,
        temperature: 0.1, // Low temperature for more deterministic extractions
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Prospect[];
      return data;
    }

    return [];
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};