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
// 🎯 TEXT GENERATION FUNCTION (New Primary Focus)
// ----------------------------------------------------------------------

/**
 * Generate a standard text response from the Gemini API.
 * @param {string} promptText - The user's text prompt.
 * @returns {string} The text response from the model.
 */
export async function generateTextResponse(promptText) {
    // 1. Check for API key
    if (!GEMINI_API_KEY) {
        throw new Error('❌ Gemini API key not found! Please add REACT_APP_GEMINI_API_KEY to your .env file');
    }

    // 2. Check for initialized client
    if (!genAI) {
        console.warn('⚠️ Falling back to DEMO mode: Gemini client not initialized.');
        return await new Promise(resolve => setTimeout(() => resolve(
            `This is a DEMO text response for prompt: "${promptText}". 
            Please check your Gemini API key initialization.`
        ), 500));
    }

    try {
        // 3. API Call Logic for Text Generation
        // Using the latest model name that's widely available
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        console.log('🤖 Sending text generation request to Gemini AI...');

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const responseText = await response.text();

        console.log('✅ Text response received.');
        return responseText.trim();

    } catch (error) {
        console.error('❌ Error during text generation:', error);
        return `❌ Error generating text response: ${error.message}. Please verify your API key and network connection.`;
    }
}

// ----------------------------------------------------------------------
// 🗑️ DEPRECATED/REMOVED IMAGE FUNCTION (Removed Placeholder Logic)
// ----------------------------------------------------------------------

// The original 'generateImage' function has been removed/deprecated as requested,
// and the focus is now on standard text-to-text response generation via generateTextResponse.


// ----------------------------------------------------------------------
// 🎯 Utility Functions (Unchanged)
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
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent("Say 'API test successful' if you can read this.");
            const response = await result.response;
            const text = await response.text();
            
            return text.toLowerCase().includes('successful');
        } catch (error) {
            console.error('Gemini API test failed:', error);
            return false;
        }
    } catch (error) {
        console.error('Gemini API test failed:', error);
        return false;
    }
}