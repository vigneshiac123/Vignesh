import { GoogleGenAI } from "@google/genai";
import { Alert } from "../types";

export const analyzeAlertWithGemini = async (alert: Alert): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set process.env.API_KEY to use AI features.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using a fast model for quick UI feedback
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Act as a Senior Cybersecurity Analyst. Analyze the following Intrusion Detection System (IDS) alert:

      Attack Type: ${alert.type}
      Severity: ${alert.severity}
      Source IP: ${alert.srcIp}
      Target IP: ${alert.targetIp}
      Description: ${alert.description}
      Timestamp: ${new Date(alert.timestamp).toISOString()}

      Provide a concise response in Markdown format with:
      1. **Analysis**: What is happening?
      2. **Risk Assessment**: Why is this dangerous?
      3. **Immediate Action**: 2-3 specific commands or steps to mitigate this now (e.g., firewall rules for Linux/iptables).
      
      Keep it brief and professional.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to connect to AI analysis service. Please check your API key and network connection.";
  }
};