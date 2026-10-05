import { useEffect, useState, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { useFortuneAI } from '../../shared/Lib'
import { Button, Loading, Textarea } from '../../shared/UI'
import styles from './Home.module.css'

export function Home() {
  const [prompt, setPrompt] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')
  const { result, is_loading, error, requestFortune } = useFortuneAI()

  useEffect(() => {
    setCopyState('idle')
  }, [result])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 2000)
    return () => window.clearTimeout(timer)
  }, [copyState])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void requestFortune(prompt)
  }

  async function handleCopy() {
    if (!result) return
    try {
      await writeClipboard(result)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  const copyLabel =
    copyState === 'done'
      ? '기록을 긁어갔어요'
      : copyState === 'failed'
        ? '기록을 남기지 못했습니다'
        : '운명의 기록 긁어가기'

  return (
    <main className={styles.page}>
      <div className={styles.sky} aria-hidden="true">
        <Starfield />
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.orb} />
          <h1>
            <span>오늘의</span>
            <span className={styles.accent}>운세</span>
          </h1>
          <p className={styles.brand}>FORTUNE VIBE</p>
          <p className={styles.lead}>
            별자리가 당신의 질문에 답합니다 <span aria-hidden="true">◆</span>
          </p>
          <div className={styles.rule}>
            <span />
            <i />
            <span />
          </div>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Textarea
            id="fortune-question"
            label="오늘 궁금한 것을 적어 주세요"
            value={prompt}
            placeholder="이번 달 연애운이 궁금해요..."
            rows={4}
            disabled={is_loading}
            onChange={setPrompt}
          />
          <Button
            className={styles.submit}
            type="submit"
            disabled={is_loading || prompt.trim().length === 0}
          >
            운세 보기
          </Button>
        </form>

        <section className={styles.result} aria-live="polite" aria-busy={is_loading}>
          {is_loading ? (
            <Loading message="운세를 읽고 있습니다" />
          ) : (
            <div className={styles.slip}>
              <h2>운세</h2>
              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : (
                result ? (
                  <>
                    <div className={styles.answer}>
                      <ReactMarkdown remarkPlugins={[remarkBreaks]}>{result}</ReactMarkdown>
                    </div>
                    <Button className={styles.share} variant="line" type="button" onClick={() => void handleCopy()}>
                      {copyLabel}
                    </Button>
                  </>
                ) : (
                  <p>질문을 보내면 이곳에 답변이 나타납니다.</p>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('timeout')), 1000)
        }),
      ])
      return
    } catch {
      copyWithSelection(text)
      return
    }
  }
  copyWithSelection(text)
}

function copyWithSelection(text: string) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  if (!copied) {
    throw new Error('복사에 실패했습니다.')
  }
}

const CONSTELLATIONS = [
  'M250 210 L340 120 L450 190 L560 115',
  'M880 120 L980 70 L1090 145 L1185 85',
  'M1090 145 L1160 220 L1060 245',
]

const BRIGHT_STARS = [
  [340, 120],
  [450, 190],
  [980, 70],
  [1090, 145],
  [1160, 220],
]

const DUST = [
  [40, 60, 0.7],
  [110, 40, 0.5],
  [220, 50, 0.8],
  [300, 30, 0.4],
  [380, 70, 0.6],
  [460, 36, 0.5],
  [980, 44, 0.6],
  [1060, 28, 0.4],
  [1140, 48, 0.7],
  [1320, 36, 0.5],
  [1400, 80, 0.6],
  [60, 220, 0.5],
  [180, 180, 0.4],
  [320, 210, 0.6],
  [400, 140, 0.45],
  [1040, 180, 0.5],
  [1120, 250, 0.4],
  [1220, 200, 0.55],
  [1380, 260, 0.5],
  [80, 480, 0.4],
  [240, 430, 0.55],
  [360, 500, 0.4],
  [1080, 470, 0.45],
  [1200, 520, 0.4],
  [1360, 500, 0.5],
  [500, 90, 0.35],
  [940, 100, 0.4],
  [160, 360, 0.35],
  [1280, 300, 0.4],
  [70, 120, 0.9],
]

function Starfield() {
  return (
    <svg className={styles.starfield} viewBox="0 0 1440 640" preserveAspectRatio="xMidYMin slice">
      <defs>
        <radialGradient id="sky-glow" cx="50%" cy="18%" r="28%">
          <stop offset="0%" stopColor="rgba(98, 52, 176, 0.42)" />
          <stop offset="100%" stopColor="rgba(7, 6, 12, 0)" />
        </radialGradient>
        <radialGradient id="star-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e4" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#e7c56a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e7c56a" stopOpacity="0" />
        </radialGradient>
        <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <g id="constellation-lines" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {CONSTELLATIONS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </defs>

      <rect width="1440" height="640" fill="url(#sky-glow)" />
      <path
        d="M360 175 C 560 55, 880 55, 1080 175"
        fill="none"
        stroke="#e7d3a4"
        strokeWidth="0.6"
        opacity="0.22"
      />

      <use href="#constellation-lines" stroke="#f0d7a0" strokeWidth="3" opacity="0.16" filter="url(#line-glow)" />
      <use
        href="#constellation-lines"
        stroke="#f6e7c4"
        strokeWidth="0.75"
        opacity="0.62"
        vectorEffect="non-scaling-stroke"
      />

      {DUST.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#f4e7c8" opacity={0.35 + r} />
      ))}

      {BRIGHT_STARS.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="11" fill="url(#star-halo)" />
          <circle cx={cx} cy={cy} r="1.35" fill="#fffaf0" />
        </g>
      ))}
    </svg>
  )
}
