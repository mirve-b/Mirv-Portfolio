import { useCallback, useEffect, useRef, useState } from 'react'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function useNowPlaying() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const setupAudioGraph = useCallback(() => {
    const audio = audioRef.current
    if (!audio || sourceRef.current) return analyserRef.current

    const context = new AudioContext()
    const nextAnalyser = context.createAnalyser()
    nextAnalyser.fftSize = 64
    nextAnalyser.smoothingTimeConstant = 0.78

    const source = context.createMediaElementSource(audio)
    source.connect(nextAnalyser)
    nextAnalyser.connect(context.destination)

    audioContextRef.current = context
    analyserRef.current = nextAnalyser
    sourceRef.current = source

    return nextAnalyser
  }, [])

  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(audio.currentTime)
    setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setAnalyser(null)
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
      audioContextRef.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    rafRef.current = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, updateProgress])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    const nextAnalyser = setupAudioGraph()
    if (!nextAnalyser || !audioContextRef.current) return

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    setAnalyser(nextAnalyser)

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }, [setupAudioGraph])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) pause()
    else await play()
  }, [isPlaying, pause, play])

  return {
    audioRef,
    isPlaying,
    progress,
    analyser,
    togglePlayback,
    formattedCurrent: formatTime(currentTime),
    formattedDuration: formatTime(duration),
  }
}
