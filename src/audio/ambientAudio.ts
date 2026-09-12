import { requiredElement } from '../ui/dom'

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

export function createAmbientAudio(): void {
  const button = requiredElement<HTMLButtonElement>('sound')
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let enabled = false

  const start = () => {
    const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
    if (!AudioContextClass) { button.disabled = true; button.textContent = 'Sound unavailable'; return }
    context = new AudioContextClass(); master = context.createGain(); master.gain.value = 0; master.connect(context.destination)
    const hum = context.createOscillator(); hum.type = 'sine'; hum.frequency.value = 56
    const humGain = context.createGain(); humGain.gain.value = 0.055; hum.connect(humGain).connect(master); hum.start()
    const harmonic = context.createOscillator(); harmonic.type = 'triangle'; harmonic.frequency.value = 112
    const harmonicGain = context.createGain(); harmonicGain.gain.value = 0.012; harmonic.connect(harmonicGain).connect(master); harmonic.start()
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate); const data = buffer.getChannelData(0)
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * 0.2
    const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 260
    const noiseGain = context.createGain(); noiseGain.gain.value = 0.018; noise.connect(filter).connect(noiseGain).connect(master); noise.start()
  }

  button.addEventListener('click', () => {
    if (!context) start()
    if (!context || !master) return
    enabled = !enabled; master.gain.cancelScheduledValues(context.currentTime); master.gain.linearRampToValueAtTime(enabled ? 0.035 : 0, context.currentTime + 0.22)
    button.textContent = enabled ? 'Sound on' : 'Sound off'; button.classList.toggle('on', enabled); button.setAttribute('aria-pressed', String(enabled))
  })
}
