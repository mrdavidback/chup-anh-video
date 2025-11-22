
import { GoogleGenAI } from "@google/genai";

const blobUrlToBase64 = async (blobUrl: string): Promise<{ base64Data: string, mimeType: string }> => {
    const blob = await fetch(blobUrl).then(res => res.blob());
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({ base64Data, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const removeSubtitlesFromImage = async (apiKey: string, base64ImageDataUrl: string): Promise<string> => {
    try {
        if (!apiKey) throw new Error("API Key is required");
        
        const ai = new GoogleGenAI({ apiKey });
        // Use English prompt for better instruction following on visual tasks
        const prompt = "Remove the subtitles or text overlays from the bottom of this image. Output only the modified image with the text removed. Maintain the original image quality and details.";

        const imagePart = {
            inlineData: {
                data: base64ImageDataUrl.split(',')[1],
                mimeType: 'image/jpeg'
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    imagePart
                ],
            },
            // Removed responseModalities to avoid potential conflicts if the model returns text preamble
        });
        
        // Fix: Iterate through all parts to find the image. 
        // The model might return text first (e.g., "Here is the image:") then the image.
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/jpeg;base64,${part.inlineData.data}`;
                }
            }
        }
        
        console.warn("Gemini did not return an image part. Returning original.");
        return base64ImageDataUrl; 

    } catch (error) {
        console.error("Error calling Gemini to remove subtitles:", error);
        return base64ImageDataUrl;
    }
};

export const removeLogoFromImage = async (apiKey: string, imageUrl: string): Promise<string> => {
    try {
        if (!apiKey) throw new Error("API Key is required");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = "Remove any logos or watermarks from this image. Output only the cleaned image. Maintain the original dimensions and quality.";

        const { base64Data, mimeType } = await blobUrlToBase64(imageUrl);

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                    imagePart
                ],
            },
        });
        
        // Fix: Iterate through all parts to find the image.
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    // Return with the original mimeType if possible, or assume result matches input context
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        console.warn("Gemini did not return an image part. Returning original.");
        return imageUrl;

    } catch (error) {
        console.error("Error calling Gemini to remove logo:", error);
        return imageUrl;
    }
};
