import { useEffect, useId, useRef, type ReactNode } from "react"
import { Icon } from "./Icon"

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  closing?: boolean
}

export function AdminModal({ title, onClose, children, wide = false, closing = false }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          onClose()
        }
      }}
      className={`admin-modal w-[calc(100%-2rem)] ${closing ? "modal-leaving" : ""} ${
        wide ? "max-w-4xl" : "max-w-xl"
      }`}
    >
      <div className="admin-modal-header">
        <h2 id={titleId} className="font-display text-lg font-semibold leading-snug">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close form" className="admin-modal-close">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <div className="admin-modal-body">{children}</div>
    </dialog>
  )
}
