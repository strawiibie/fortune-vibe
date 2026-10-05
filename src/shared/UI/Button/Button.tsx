import type { ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'solid' | 'line'
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function Button({
  children,
  type = 'button',
  variant = 'solid',
  disabled = false,
  className,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={[styles.button, variant === 'line' && styles.line, className].filter(Boolean).join(' ')}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
