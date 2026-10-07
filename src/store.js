import { useSyncExternalStore } from 'react'

// Tiny external store for UI state that React needs to re-render on.
const state = {
  started: false,
  mode: 'walk', // 'walk' | 'tour' | 'overview'
  time: 'day', // 'day' | 'night'
  quality: 'high', // 'high' | 'low'
  room: 'living',
  caption: null, // { code, title, text }
  tourProgress: 0,
  hint: true,
}
const listeners = new Set()

export const getState = () => state
export function setState(patch) {
  let changed = false
  for (const k in patch) {
    if (state[k] !== patch[k]) {
      state[k] = patch[k]
      changed = true
    }
  }
  if (changed) {
    snapshot = { ...state }
    listeners.forEach((l) => l())
  }
}
let snapshot = { ...state }
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
export const useStore = (sel) => useSyncExternalStore(subscribe, () => sel(snapshot))

// Per-frame values live outside React: the player pose (metres, radians)
// and one-shot requests the player consumes on the next frame.
export const pose = { x: 0.45, z: 1.4, yaw: 0, pitch: 0 }
export const requests = { teleport: null }

export function teleport(xm, zm, yaw, pitch = -0.04) {
  requests.teleport = { x: xm, z: zm, yaw, pitch }
}
