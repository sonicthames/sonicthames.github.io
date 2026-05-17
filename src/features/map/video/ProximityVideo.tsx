import type { CSSProperties } from "react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  ViewTransition,
} from "react"
import type { Sound } from "@/domain/sound"
import { cn } from "@/lib/utils"
import {
  headerTitle,
  proximityVideo,
  proximityVideoFrame,
  videoHeader,
  videoSection,
  videoSectionDescription,
  videoSectionTitle,
} from "./ProximityVideo.css"
import { PROXIMITY_VIDEO_TRANSITION_DURATION_MS } from "./proximityVideoConstants"

const DOCK_WIDTH = 240
const DOCK_HEIGHT = 135
const DOCK_MARGIN = 24

interface Origin {
  readonly x: number
  readonly y: number
}

interface Props {
  readonly sound: Sound | null
  readonly origin: Origin | null
  readonly allowPlayback: boolean
}

type PendingSound = {
  readonly sound: Sound
  readonly origin: Origin
}

const scheduleFrame = (cb: () => void): number => {
  if (
    typeof window === "undefined" ||
    typeof window.requestAnimationFrame !== "function"
  ) {
    return window.setTimeout(cb, 16)
  }
  return window.requestAnimationFrame(cb)
}

const cancelFrame = (frame: number | null) => {
  if (frame === null) {
    return
  }
  if (
    typeof window === "undefined" ||
    typeof window.cancelAnimationFrame !== "function"
  ) {
    clearTimeout(frame)
    return
  }
  window.cancelAnimationFrame(frame)
}

export const ProximityVideo = ({ sound, origin, allowPlayback }: Props) => {
  const [displayedSound, setDisplayedSound] = useState<Sound | null>(null)
  const [activeOrigin, setActiveOrigin] = useState<Origin | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldPlay, setShouldPlay] = useState(false)
  const hideTimeoutRef = useRef<number | null>(null)
  const visibilityFrameRef = useRef<number | null>(null)
  const pendingRef = useRef<PendingSound | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [, startTransition] = useTransition()

  const setVisibility = useCallback((value: boolean) => {
    cancelFrame(visibilityFrameRef.current)
    visibilityFrameRef.current = scheduleFrame(() => {
      visibilityFrameRef.current = null
      setIsVisible(value)
    })
  }, [])

  useEffect(() => () => cancelFrame(visibilityFrameRef.current), [])

  useEffect(() => {
    let cancelled = false
    const frame = scheduleFrame(() => {
      if (cancelled) {
        return
      }

      if (!sound || !origin) {
        pendingRef.current = null
        if (displayedSound) {
          setVisibility(false)
        }
        return
      }

      if (!displayedSound) {
        setActiveOrigin(origin)
        setDisplayedSound(sound)
        setVisibility(true)
        return
      }

      if (displayedSound.title === sound.title) {
        setActiveOrigin(origin)
        return
      }

      const queued = { sound, origin }
      pendingRef.current = queued
      setActiveOrigin(origin)
      setVisibility(false)
    })

    return () => {
      cancelled = true
      cancelFrame(frame)
    }
  }, [sound, origin, displayedSound, setVisibility])

  useEffect(() => {
    if (!displayedSound || isVisible) {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      return
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      hideTimeoutRef.current = null
      const pending = pendingRef.current
      if (pending) {
        pendingRef.current = null
        setActiveOrigin(pending.origin)
        setDisplayedSound(pending.sound)
        setVisibility(true)
        return
      }
      setDisplayedSound(null)
      setActiveOrigin(null)
    }, PROXIMITY_VIDEO_TRANSITION_DURATION_MS)

    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
  }, [displayedSound, isVisible, setVisibility])

  useEffect(() => {
    let frame: number | null = null

    frame = scheduleFrame(() => {
      if (!allowPlayback || !displayedSound) {
        setShouldPlay(false)
        return
      }

      if (isVisible) {
        startTransition(() => {
          setShouldPlay(true)
        })
      } else {
        setShouldPlay(false)
      }
    })

    return () => cancelFrame(frame)
  }, [allowPlayback, displayedSound, isVisible])

  if (!displayedSound || !activeOrigin) {
    return null
  }

  const dockLeft = DOCK_MARGIN
  const dockTop =
    typeof window === "undefined"
      ? DOCK_MARGIN
      : Math.max(DOCK_MARGIN, window.innerHeight - DOCK_HEIGHT - DOCK_MARGIN)
  const originTopLeft = {
    x: activeOrigin.x - DOCK_WIDTH / 2,
    y: activeOrigin.y - DOCK_HEIGHT / 2,
  }
  const position = isVisible
    ? { left: dockLeft, top: dockTop, scale: 1, opacity: 1 }
    : { left: originTopLeft.x, top: originTopLeft.y, scale: 0.1, opacity: 0 }

  const proximityVideoStyle: CSSProperties = {
    opacity: position.opacity,
    pointerEvents: isVisible ? "auto" : "none",
    transform: `translate3d(${position.left}px, ${position.top}px, 0) scale(${position.scale})`,
    width: `${DOCK_WIDTH}px`,
    height: `${DOCK_HEIGHT}px`,
  }
  const transitionModeKey = `${displayedSound.title}-${isVisible ? "open" : "closed"}`

  const params = new URLSearchParams({
    rel: "0",
    autoplay: "1",
    playsinline: "1",
    controls: "1",
    mute: "0",
    modestbranding: "1",
    fs: "0",
  })
  const iframeSrc = shouldPlay
    ? `https://www.youtube.com/embed/${displayedSound.videoSrc}?${params.toString()}`
    : null

  return (
    <ViewTransition name="proximity-video">
      <div
        key={transitionModeKey}
        className={proximityVideo}
        style={proximityVideoStyle}
      >
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            title={`proximity preview: ${displayedSound.title}`}
            className={proximityVideoFrame}
            src={iframeSrc}
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        )}
        <section className={videoSection}>
          <div className={videoHeader}>
            <span className={cn(headerTitle, videoSectionTitle)}>
              {displayedSound.title}
            </span>
          </div>
          <div className={videoSectionDescription}>
            {displayedSound.description.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static description paragraphs
              <p key={`${displayedSound.videoSrc}-${index}`}>{line}</p>
            ))}
          </div>
        </section>
      </div>
    </ViewTransition>
  )
}
