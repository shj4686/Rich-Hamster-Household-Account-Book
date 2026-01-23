
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const addTransactionFunction: FunctionDeclaration = {
  name: 'addTransaction',
  parameters: {
    type: Type.OBJECT,
    description: '가계부에 새로운 지출이나 수입 항목을 추가합니다.',
    properties: {
      type: {
        type: Type.STRING,
        description: '항목 유형: INCOME (수입) 또는 EXPENSE (지출)',
        enum: ['INCOME', 'EXPENSE']
      },
      category: {
        type: Type.STRING,
        description: '카테고리 (월급, 보너스, 식비, 교통 등)',
      },
      amount: {
        type: Type.NUMBER,
        description: '금액 (원)',
      },
      description: {
        type: Type.STRING,
        description: '간단한 설명',
      },
      date: {
        type: Type.STRING,
        description: '날짜 (YYYY-MM-DD)',
      }
    },
    required: ['type', 'category', 'amount', 'date'],
  },
};

export const chatWithHamster = async (
  message: string, 
  history: any[], 
  onTransaction: (data: any) => void
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "당신은 '부자 햄스터' 가계부 비서입니다. 사용자가 지출이나 수입 내역을 말하면 addTransaction 도구를 사용하여 기록하세요. 말투는 '~했츄', '~했어용' 처럼 햄스터 느낌이 나면서도 부자답게 품위 있고 친절해야 합니다.",
        tools: [{ functionDeclarations: [addTransactionFunction] }],
      },
    });
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const fc of response.functionCalls) {
        if (fc.name === 'addTransaction') {
          onTransaction(fc.args);
          return {
            text: `${fc.args.category} 내역으로 ${fc.args.amount.toLocaleString()}원을 장부에 적어두었츄! 부자가 되는 한 걸음이네용 🐹💎`,
            role: 'model' as const
          };
        }
      }
    }

    return {
      text: response.text || "미안해용, 다시 한 번 말씀해 주시겠츄? 🐹",
      role: 'model' as const
    };
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
};
