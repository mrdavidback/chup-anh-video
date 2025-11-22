
import { GoogleGenAI, Modality } from "@google/genai";

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
        const prompt = "Đây là một ảnh chụp màn hình từ video. Vui lòng xóa văn bản phụ đề xuất hiện ở cuối ảnh một cách thông minh. Ảnh đầu ra phải có cùng kích thước với ảnh đầu vào. Nếu không có phụ đề, hãy trả lại ảnh gốc.";

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
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            const base64ImageBytes = firstPart.inlineData.data;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            console.warn("Gemini không trả về hình ảnh. Trả lại ảnh gốc.");
            return base64ImageDataUrl; // Quay lại ảnh gốc
        }

    } catch (error) {
        console.error("Lỗi khi gọi Gemini để xóa phụ đề:", error);
        // Khi có lỗi, trả lại ảnh gốc để không làm gián đoạn quy trình
        return base64ImageDataUrl;
    }
};

export const removeLogoFromImage = async (apiKey: string, imageUrl: string): Promise<string> => {
    try {
        if (!apiKey) throw new Error("API Key is required");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = "Vui lòng xóa một cách thông minh bất kỳ logo hoặc watermark nào khỏi hình ảnh này. Hình ảnh đầu ra phải có cùng kích thước với hình ảnh đầu vào. Nếu không có logo, hãy trả lại hình ảnh gốc.";

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
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            const base64ImageBytes = firstPart.inlineData.data;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
            console.warn("Gemini không trả về hình ảnh. Trả lại ảnh gốc.");
            return imageUrl;
        }

    } catch (error) {
        console.error("Lỗi khi gọi Gemini để xóa logo:", error);
        return imageUrl;
    }
};
