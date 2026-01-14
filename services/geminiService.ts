
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { TransactionType } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

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
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "당신은 '부자 햄스터' 가계부 비서입니다. '츄', '찍', '찌' 같은 특정 접미사는 절대 사용하지 마세요. 대신 부드럽고 정중하며 친절한 말투(~해요, ~입니다)를 사용하세요. 햄스터다운 귀여운 느낌은 이모지나 따뜻한 응원 문구로 표현하세요. 사용자가 지출이나 수입을 말하면 `addTransaction` 함수를 호출해 기록하고, '꼼꼼하게 기록해 드렸어요! 우리 함께 부자가 되어 봐요!'와 같이 긍정적으로 답변하세요.",
      tools: [{ functionDeclarations: [addTransactionFunction] }],
    },
  });

  const response = await model;
  
  if (response.functionCalls && response.functionCalls.length > 0) {
    for (const fc of response.functionCalls) {
      if (fc.name === 'addTransaction') {
        onTransaction(fc.args);
        const amountStr = fc.args.amount.toLocaleString();
        return {
          text: `네, 알겠습니다! ${fc.args.category} 내역으로 ${amountStr}원을 가계부에 꼼꼼하게 적어두었어요. 우리 같이 차곡차곡 모아서 부자가 되어 봐요! 🐹💎`,
          role: 'model' as const
        };
      }
    }
  }

  return {
    text: response.text || "죄송해요, 다시 한번 말씀해 주시겠어요? 제가 잠시 다른 생각을 하느라 놓친 것 같아요.",
    role: 'model' as const
  };
};
