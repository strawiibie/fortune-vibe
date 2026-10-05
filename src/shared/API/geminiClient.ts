const MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite']
const BUSY_MESSAGE = '지금 운세를 읽는 사람이 많습니다. 잠시 후 다시 눌러 주세요.'

const ORACLE_INSTRUCTION = `역할:
당신은 고대의 신비로운 존재인 '운명의 오라클'입니다.
사용자의 질문을 받아 운세 또는 조언을 신비롭고 재미있는 분위기로 전달합니다.

출력 규칙:
- 반드시 마크다운 형식으로만 응답하세요. 설명이나 코드 블록은 붙이지 마세요.
- 응답은 항상 다음 문장으로 시작해야 합니다.
오직 운명의 수레바퀴만이 이 질문에 대답할 수 있습니다.
- 그 문장 다음에는 빈 줄을 하나 넣으세요.
- 답변의 제목은 ## **제목** 처럼 ## 볼드체 헤더 형식으로 작성하세요.
- 제목 다음에 운세 문장을 쓰고, 그 아래 빈 줄을 넣으세요.
- 조언은 반드시 3가지 항목으로 구성하고, '-'를 사용한 마크다운 리스트로 작성하세요.
- 문장과 항목 사이의 개행을 정확히 지켜 가독성을 유지하세요.
- 답변의 마지막 줄에는 행운을 상징하는 이모지 🔮를 반드시 포함하세요.

출력 내용:
사용자의 질문을 바탕으로 한 운세 또는 조언을 제공합니다.

출력 형식:
오직 운명의 수레바퀴만이 이 질문에 대답할 수 있습니다.

## **제목**

운세 문장

- 첫 번째 조언
- 두 번째 조언
- 세 번째 조언

🔮`

type GeminiPart = {
  text?: string
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
  }>
  error?: {
    message?: string
  }
}

function canTryAnotherModel(status: number, message: string) {
  return (
    status === 429 ||
    status === 503 ||
    status === 404 ||
    /high demand|unavailable|overloaded|no longer available|not found/i.test(message)
  )
}

async function requestFortune(apiKey: string, model: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: ORACLE_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  )

  const data = (await response.json()) as GeminiResponse
  if (!response.ok) {
    const message = data.error?.message ?? ''
    const error = new Error(canTryAnotherModel(response.status, message) ? BUSY_MESSAGE : message || 'Gemini API 요청에 실패했습니다.')
    error.name = canTryAnotherModel(response.status, message) ? 'RetryableGeminiError' : 'GeminiError'
    throw error
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('운세 답변을 받지 못했습니다.')
  }

  return text
}

export async function generateFortune(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되어 있지 않습니다.')
  }

  let lastError = new Error(BUSY_MESSAGE)

  for (const model of MODELS) {
    try {
      return await requestFortune(apiKey, model, prompt)
    } catch (caught) {
      if (!(caught instanceof Error)) {
        throw new Error('운세를 읽지 못했습니다.')
      }
      if (caught.name !== 'RetryableGeminiError') {
        if (caught instanceof TypeError) {
          throw new Error('운세를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.')
        }
        throw caught
      }
      lastError = caught
    }
  }

  throw lastError
}
