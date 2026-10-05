import styles from './Textarea.module.css'

type TextareaProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  onChange: (value: string) => void
}

export function Textarea({
  id,
  label,
  value,
  placeholder,
  rows = 4,
  disabled = false,
  onChange,
}: TextareaProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        className={styles.textarea}
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
