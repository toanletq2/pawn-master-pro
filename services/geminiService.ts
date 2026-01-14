
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getValuationAdvice = async (brand: string, model: string, condition: string) => {
  const ai = getAI();
  const identity = brand ? `${brand} ${model}` : model;
  
  const prompt = `Bạn là chuyên gia định giá điện thoại cũ tại thị trường Việt Nam. 
  Định giá máy: ${identity}
  Tình trạng: ${condition}
  
  Hãy cung cấp thông tin cực kỳ ngắn gọn và chính xác cho cửa hàng cầm đồ.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resalePriceRange: {
              type: Type.STRING,
              description: "Giá bán (VD: 15-16tr)",
            },
            safeLoanRange: {
              type: Type.STRING,
              description: "Cầm tối đa (VD: 11tr)",
            },
            keyChecks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 điểm cần check nhất",
            },
            marketNote: {
              type: Type.STRING,
              description: "Thanh khoản (VD: Rất nhanh)",
            }
          },
          required: ["resalePriceRange", "safeLoanRange", "keyChecks", "marketNote"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Valuation Error:", error);
    return null;
  }
};

export const analyzePhoneImage = async (base64Image: string) => {
  const ai = getAI();
  const prompt = "Phân tích ảnh điện thoại: xác định model, màu sắc, tình trạng ngoại quan. Trả về nhận xét ngắn gọn dưới 30 từ.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "Không thể phân tích hình ảnh.";
  }
};
