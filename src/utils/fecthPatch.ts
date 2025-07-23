let fetchPatched = false
//TODO REMOVE
export function patchFetch() {
  if (!fetchPatched) {
    const originalFetch = window.fetch

    window.fetch = (url, options = {}) => {
      return originalFetch(url, {
        ...options,
        // credentials:
        //   url.toString().includes('user-op-reverse-proxy') || url.toString().includes('/world-id/verify')
        //     ? 'include'
        //     : undefined,
      })
    }

    fetchPatched = true
  }
}
