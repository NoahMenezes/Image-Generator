import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ IMPORTANT: Add your Gemini API Key here or use environment variables
// Get your free API key from: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize Gemini AI
let genAI;
// Initialize only if API key exists
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ----------------------------------------------------------------------
// 🎯 Image Generation Function
// ----------------------------------------------------------------------

/**
 * Generate a base64-encoded image based on a text prompt using the Gemini API.
 * * NOTE: This is a placeholder structure. True image generation requires dedicated
 * * models/endpoints (like Imagen) often separate from the primary generateContent flow.
 * * @param {string} promptText - The user's prompt describing the desired image.
 * * @returns {string} Base64-encoded image data string (or a demo/error message).
 */
export async function generateImage(promptText) {
    // 1. Check for API key
    if (!GEMINI_API_KEY) {
        throw new Error('❌ Gemini API key not found! Please add REACT_APP_GEMINI_API_KEY to your .env file');
    }
    
    // 2. Mock Data for unavailable API
    if (!genAI) {
        console.warn('⚠️ Falling back to DEMO mode: Gemini client not initialized.');
        return await new Promise(resolve => setTimeout(() => resolve(
            `This is a DEMO response for prompt: "${promptText}". 
            Image generation requires a working Gemini API key and a dedicated model setup.`
        ), 1500));
    }

    try {
        // 3. API Call Logic (Simplified Placeholder for Image Generation)
        
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 
        
        const imagePrompt = `Generate a creative, detailed, high-resolution image based on the following description. 
        Your response must ONLY be the base64-encoded string of the generated image: "${promptText}"`;

        console.log('🤖 Sending image generation request to Gemini AI...');
        
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
        });

        const responseText = result.response.text.trim();
        
        if (responseText.length > 500) {
            console.log('✅ Image data received (Simulated Base64 string).');
            return responseText; // Return the base64 string
        } else {
            throw new Error(`Model did not return a base64 image string. Response: ${responseText.substring(0, 100)}...`);
        }
        
    } catch (error) {
        console.error('❌ Error during image generation:', error);
        
        return `❌ Error generating image: ${error.message}. Please verify your API key and model capability for image generation.`;
    }
}

// ----------------------------------------------------------------------
// 🎯 Utility Functions
// ----------------------------------------------------------------------

/**
 * Test function to verify API connection with a simple text prompt.
 * @returns {boolean} True if API is working
 */
export async function testGeminiConnection() {
    try {
        if (!GEMINI_API_KEY || !genAI) {
            return false;
        }
        
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent("Say 'API test successful' if you can read this.");
        const response = await result.response;
        
        return response.text().toLowerCase().includes('successful');
    } catch (error) {
        console.error('Gemini API test failed:', error);
        return false;
    }
}