import React, { useEffect, useState } from 'react'
import { registerConfirm } from '../../ui/confirm'

const ConfirmDialog = () => {
  const [pending, setPending] = useState(null)

  useEffect(() => registerConfirm((request) => setPending(request)), [])

  if (!pending) return null

  const close = (accepted) => {
    pending.resolve(accepted)
    setPending(null)
  }

  return (
    <div className="bracket-modal" onClick={() => close(false)}>
      <div className="bracket-modal-card" onClick={(event) => event.stopPropagation()}>
        <p className="sx-4" >{pending.message}</p>
        <div className="sx-5" >
          <button type="button" className="btn btn-secondary btn-block" onClick={() => close(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-block" onClick={() => close(true)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
