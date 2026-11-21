import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" type="button" aria-label="Закрыть" onClick={onClose}><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function FormActions({ onCancel, label = 'Сохранить' }: { onCancel: () => void; label?: string }) {
  return <div className="form-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Отмена</button><button type="submit" className="button button-primary">{label}</button></div>
}
