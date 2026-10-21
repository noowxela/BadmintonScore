let openRequest = null

export const registerConfirm = (open) => {
  openRequest = open
  return () => {
    if (openRequest === open) openRequest = null
  }
}

export const askConfirm = (message) => new Promise((resolve) => {
  if (!openRequest) {
    resolve(window.confirm(message))
    return
  }
  openRequest({ message, resolve })
})
