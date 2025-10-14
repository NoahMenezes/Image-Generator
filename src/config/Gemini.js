// Configuration for Gemini API
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const IMAGE_GEN_MODEL = 'gemini-2.0-flash';
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate an image using the Gemini API
 * @param {string} prompt - The text prompt for image generation
 * @returns {Promise<string>} Base64-encoded image data or error message
 */
export const generateImageResponse = async (prompt) => {
    if (!GEMINI_API_KEY) {
        return '❌ Error: Missing Gemini API Key. Please set REACT_APP_GEMINI_API_KEY in your environment variables.';
    }
    

    const apiUrl = `${API_BASE_URL}/${IMAGE_GEN_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
        contents: [{
            parts: [{
                text: `Generate a detailed image of: ${prompt}. The image should be photorealistic and high quality.`
            }]
        }],
        generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
            }
        ]
    };

    try {
        console.log(`Sending request to ${IMAGE_GEN_MODEL}...`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return `❌ API Error: ${errorData.error?.message || 'Unknown error occurred'}`;
        }
        
        const result = await response.json();
        
        // Extract the image data from the response
        const imageData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (imageData) {
            console.log('✅ Image generated successfully');
            return imageData;
        } else {
            const blockReason = result.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                return '❌ Error: Image generation blocked due to safety settings. Please try a different prompt.';
            }
            return '❌ Error: Failed to generate image. The response did not contain valid image data.';
        }
    } catch (error) {
        console.error('Error during image generation:', error);
        return `❌ Network Error: ${error.message}. Please check your internet connection.`;
    }
};
