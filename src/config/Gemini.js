import { GoogleGenerativeAI } from '@google/generative-ai'; 

// ⚠️ IMPORTANT: Add your Gemini API Key here or use environment variables 
// Get your free API key from: https://makersuite.google.com/app/apikey 
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

// --- CONFIGURATION ---
// Model used for image generation
const IMAGEN_MODEL = 'imagen-3.0-generate-002';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate an image using the Imagen model.
 * * This function uses the `fetch` API to call the specialized Imagen prediction
 * endpoint, as required for image generation.
 * * @param {string} promptText - The user's text prompt for image generation.
 * @returns {string} The Base64-encoded image data string (or an error message).
 */
export async function generateImageResponse(promptText) {
    if (!GEMINI_API_KEY) { 
        throw new Error('❌ Gemini API key not found! Please add REACT_APP_GEMINI_API_KEY to your .env file'); 
    } 

    if (!promptText || promptText.trim() === '') {
        return "❌ Error: Please enter a prompt to generate an image.";
    }

    const payload = { 
        instances: [{ prompt: promptText }], 
        parameters: { 
            sampleCount: 1,
            aspectRatio: "1:1", 
            outputMimeType: "image/jpeg"
        } 
    };

    const apiUrl = `${API_BASE_URL}/${IMAGEN_MODEL}:predict?key=${GEMINI_API_KEY}`;

    try { 
        console.log(`🤖 Sending image generation request to ${IMAGEN_MODEL}...`); 

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();

        if (result.error) {
            console.error('❌ API Error Details:', result.error);
            return `❌ API Error: ${result.error.message}`;
        }

        // Extract Base64 encoded image data
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            console.log('✅ Image data received.');
            // Return the raw base64 string
            return result.predictions[0].bytesBase64Encoded; 
        } else {
            return "❌ Error: Failed to retrieve image data from the prediction. Response might have been blocked or the API structure changed.";
        }

    } catch (error) { 
        console.error('❌ Error during image generation:', error); 
        return `❌ Network Error: ${error.message}. Check your connection or API configuration.`; 
    } 
}
