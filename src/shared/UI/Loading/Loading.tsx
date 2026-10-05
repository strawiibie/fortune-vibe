import styles from './Loading.module.css'

type LoadingProps = {
  message?: string
}

export function Loading({ message = '불러오는 중입니다' }: LoadingProps) {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <span className={styles.ring} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  )
}
