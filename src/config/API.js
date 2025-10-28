// Using Pollinations AI for FREE Image Generation (No API Key Required!)
const POLLINATIONS_API_URL = "https://image.pollinations.ai/prompt";

/**
 * Generates an image from a text prompt using Pollinations AI
 * @param {string} prompt - User's text prompt describing the image
 * @returns {Promise<Object>} - Object containing image URL or error
 */
export async function generateImage(prompt) {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return {
        error: true,
        message: "❌ Please provide a prompt to generate an image.",
      };
    }

    // Enhance the prompt for better results
    const enhancedPrompt = enhanceImagePrompt(prompt);

    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    // Pollinations API returns an image directly via URL
    // Add parameters for better quality
    const imageUrl = `${POLLINATIONS_API_URL}/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;

    // Fetch the image to verify it loads
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`);
    }

    // Convert image to base64 for consistent display
    const blob = await response.blob();
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URL prefix to get just the base64 string
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return {
      error: false,
      image: base64Image,
      url: imageUrl, // Also return URL in case needed
    };
  } catch (error) {
    console.error("generateImage error:", error);

    // Handle network errors
    if (error.message.includes("Failed to fetch")) {
      return {
        error: true,
        message:
          "❌ Network error. Please check your internet connection and try again.",
      };
    }

    return {
      error: true,
      message: `❌ Failed to generate image: ${error.message}`,
    };
  }
}

/**
 * Enhances user prompt to create better image generation results
 * @param {string} userInput - User's simple text input
 * @returns {string} - Enhanced prompt with artistic details
 */
export function enhanceImagePrompt(userInput) {
  // Clean the input
  const cleanInput = userInput.trim();

  // Add quality and style modifiers to improve image generation
  const qualityModifiers =
    "highly detailed, professional quality, 8k resolution, masterpiece, trending on artstation";

  // If prompt is very short (1-2 words), add helpful context
  if (cleanInput.split(" ").length < 3) {
    return `${cleanInput}, ${qualityModifiers}, stunning digital art, vibrant colors`;
  }

  // If prompt is already detailed (10+ words), just add quality boost
  if (cleanInput.split(" ").length >= 10) {
    return `${cleanInput}, highly detailed, professional quality`;
  }

  // For medium length prompts, add full enhancements
  return `${cleanInput}, ${qualityModifiers}`;
}

/**
 * Generates a text response (placeholder for text generation functionality)
 * @param {string} prompt - User's text prompt
 * @returns {Promise<string>} - Generated text response
 */
export async function generateTextResponse(prompt) {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return "❌ Please provide a prompt to generate a response.";
    }

    // This is a placeholder function. You can integrate a text generation API here
    // For now, it returns a simple echo response
    return `DEMO MODE: You asked about "${prompt}". Text generation API integration is needed here. Consider using OpenAI API, Google Gemini, or another text generation service.`;
  } catch (error) {
    console.error("generateTextResponse error:", error);
    return `❌ Failed to generate response: ${error.message}`;
  }
}

// Export the primary function
export default generateImage;
