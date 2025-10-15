// Configuration for Google Imagen API
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';
const IMAGE_MODEL = 'imagen-3.0-generate-002';
const API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict`;

/**
 * Generate an image using Google's Imagen 3.0 API
 * @param {string} prompt - The text prompt for image generation
 * @returns {Promise<string>} Base64-encoded image data or error message
 */
export const generateImageResponse = async (prompt) => {
    if (!GOOGLE_API_KEY) {
        return '❌ Error: Missing Google API Key. Please set REACT_APP_GOOGLE_API_KEY in your .env file.';
    }

    const payload = {
        instances: [
            {
                prompt: prompt
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_only_high",
            personGeneration: "allow_adult"
        }
    };

    try {
        console.log('Sending request to Google Imagen API...');
        console.log('Model:', IMAGE_MODEL);
        console.log('Prompt:', prompt);
        
        const response = await fetch(`${API_BASE_URL}?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            return `❌ API Error: ${response.status} - ${errorData}`;
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Extract the base64 image from Imagen response
        const imageData = result.predictions?.[0]?.bytesBase64Encoded;
        
        if (imageData) {
            console.log('✅ Image generated successfully with Imagen 3.0');
            return imageData;
        } else {
            console.error('No image data in response:', result);
            return '❌ Error: Failed to generate image. The response did not contain valid image data.';
        }
    } catch (error) {
        console.error('Error during image generation:', error);
        return `❌ Network Error: ${error.message}. Please check your internet connection.`;
    }
};
