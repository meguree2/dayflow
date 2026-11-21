/** Keeps platform-specific behavior out of UI code for a future Tauri bridge. */
export function isTauri() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function platformName() {
  return isTauri() ? 'Tauri Desktop' : 'Web App'
}
