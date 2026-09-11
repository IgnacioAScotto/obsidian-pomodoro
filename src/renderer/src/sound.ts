/** Campanita de tres notas generada con WebAudio: no hace falta ningún archivo de audio. */
export function playChime(): void {
  const ctx = new AudioContext()
  const notes = [660, 880, 990]

  notes.forEach((frequency, i) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = ctx.currentTime + i * 0.18

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)

    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.65)
  })

  setTimeout(() => ctx.close(), 1500)
}
