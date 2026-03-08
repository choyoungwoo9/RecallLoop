import { create } from 'zustand'

const useTimerStore = create((set) => ({
  timerInterval: null,
  startTimer: () => {
    set({ timerInterval: Date.now() })
  },
  stopTimer: () => {
    set({ timerInterval: null })
  },
}))

export default useTimerStore
