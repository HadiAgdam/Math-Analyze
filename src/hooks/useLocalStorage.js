import { useState } from 'react'

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const stored = JSON.parse(localStorage.getItem(key)); return Array.isArray(stored) ? stored : initial } catch { return initial }
  })
  const update = next => setValue(previous => {
    const resolved = typeof next === 'function' ? next(previous) : next
    try { localStorage.setItem(key, JSON.stringify(resolved)) } catch {}
    return resolved
  })
  return [value, update]
}
