import { useState } from 'react'
import { generateFortune } from '../../API'

export function useFortuneAI() {
  const [result, setResult] = useState('')
  const [is_loading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestFortune(prompt: string) {
    const question = prompt.trim()
    if (!question || is_loading) return

    setIsLoading(true)
    setError(null)
    setResult('')

    try {
      const fortune = await generateFortune(question)
      setResult(fortune)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '운세를 읽지 못했습니다.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { result, is_loading, error, requestFortune }
}
