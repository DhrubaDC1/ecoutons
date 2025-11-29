import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA8yHTfRyonp61DcZLlZ3Uztc_7-D4J_6A";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log("Listing available models...");
    // There isn't a direct listModels method on the client instance in the simple SDK usage,
    // but the error message suggested it. 
    // Actually, looking at the docs/SDK, usually we just try a model.
    // However, let's try to use the model that is definitely there.
    // Maybe "gemini-1.0-pro"?
    
    // Let's try to fetch a known model directly.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash-latest worked:", await result.response.text());
    
  } catch (error) {
    console.error("Error with gemini-1.5-flash-latest:", error.message);
    
    try {
        console.log("Trying gemini-1.0-pro...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-1.0-pro worked:", await result2.response.text());
    } catch (e2) {
        console.error("Error with gemini-1.0-pro:", e2.message);
    }
  }
}

listModels();
