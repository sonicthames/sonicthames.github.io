import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState, ViewTransition } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Sound } from "../../domain/base"
import { proximityVideo, proximityVideoFrame } from "./ProximityVideo.css"
import { PROXIMITY_VIDEO_TRANSITION_DURATION_MS } from "./proximityVideoConstants"

const PLAYER_WIDTH = 320
const PLAYER_HEIGHT = 180
const DOCK_MARGIN = 12
const ORIGIN_PREVIEW_SCALE = 0.01
const INITIAL_SCALE = 0.1
const MOBILE_PREVIEW_SCALE = 0.6
const PORTRAIT_MOBILE_MEDIA_QUERY =
  "(max-width: 768px) and (orientation: portrait)"

type Rect = {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

type Layouts = {
  readonly origin: Rect
  readonly dock: Rect
}

type Phase = "idle" | "opening" | "dock" | "closing"

const scheduleMicrotask = (callback: () => void) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback)
  } else {
    Promise.resolve().then(callback)
  }
}

const useIsPortraitMobile = () => {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }
    return window.matchMedia(PORTRAIT_MOBILE_MEDIA_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia(PORTRAIT_MOBILE_MEDIA_QUERY)
    const handler = (event: MediaQueryListEvent) => setValue(event.matches)
    media.addEventListener("change", handler)
    return () => {
      media.removeEventListener("change", handler)
    }
  }, [])

  return value
}

const buildLayouts = (
  map: MapRef | null,
  sound: Sound,
  isPortraitMobile: boolean,
): Layouts | null => {
  if (!map) return null
  const mapInstance = map.getMap()
  const container = mapInstance.getContainer()
  if (!container) return null

  const containerRect = container.getBoundingClientRect()
  const containerWidth = Math.max(0, containerRect.width)
  const containerHeight = Math.max(0, containerRect.height)
  if (containerWidth === 0 || containerHeight === 0) {
    return null
  }

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const mapLeft = containerRect.left
  const mapTop = containerRect.top

  const screenPoint = mapInstance.project([
    sound.coordinates.lng,
    sound.coordinates.lat,
  ])

  const originWidth = Math.max(1, PLAYER_WIDTH * ORIGIN_PREVIEW_SCALE)
  const originHeight = Math.max(1, PLAYER_HEIGHT * ORIGIN_PREVIEW_SCALE)
  const originLeftRelative = clamp(
    screenPoint.x - originWidth / 2,
    0,
    Math.max(0, containerWidth - originWidth),
  )
  const originTopRelative = clamp(
    screenPoint.y - originHeight / 2,
    0,
    Math.max(0, containerHeight - originHeight),
  )

  const origin: Rect = {
    left: mapLeft + originLeftRelative,
    top: mapTop + originTopRelative,
    width: originWidth,
    height: originHeight,
  }

  if (isPortraitMobile) {
    const dockHeight = containerHeight / 2
    return {
      origin,
      dock: {
        left: mapLeft,
        top: mapTop + (containerHeight - dockHeight),
        width: containerWidth,
        height: dockHeight,
      },
    }
  }

  const dockTopRelative = clamp(
    containerHeight - DOCK_MARGIN - PLAYER_HEIGHT,
    DOCK_MARGIN,
    Math.max(DOCK_MARGIN, containerHeight - PLAYER_HEIGHT),
  )

  return {
    origin,
    dock: {
      left: mapLeft + DOCK_MARGIN,
      top: mapTop + dockTopRelative,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    },
  }
}

interface Props {
  readonly sound: Sound | null
  readonly mapRef: React.RefObject<MapRef | null>
}

export const ProximityVideo = ({ sound, mapRef }: Props) => {
  const [phase, setPhase] = useState<Phase>("idle")
  const [displayedSound, setDisplayedSound] = useState<Sound | null>(null)
  const [layouts, setLayouts] = useState<Layouts | null>(null)
  const [isDocked, setIsDocked] = useState(false)
  const isPortraitMobile = useIsPortraitMobile()
  const pendingSoundRef = useRef<Sound | null>(null)
  const animationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (sound === displayedSound) {
      return
    }

    let cancelled = false
    scheduleMicrotask(() => {
      if (cancelled) {
        return
      }

      if (!sound) {
        if (displayedSound) {
          pendingSoundRef.current = null
          setPhase("closing")
        } else {
          setLayouts(null)
          setPhase("idle")
        }
        return
      }

      if (!displayedSound) {
        setDisplayedSound(sound)
        setPhase("opening")
        return
      }

      pendingSoundRef.current = sound
      setPhase("closing")
    })

    return () => {
      cancelled = true
    }
  }, [sound, displayedSound])

  useEffect(() => {
    if (phase !== "closing") {
      return
    }

    scheduleMicrotask(() => {
      setIsDocked(false)
    })
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    let cancelled = false
    animationTimeoutRef.current = window.setTimeout(() => {
      animationTimeoutRef.current = null
      if (cancelled) {
        return
      }
      if (pendingSoundRef.current) {
        const next = pendingSoundRef.current
        pendingSoundRef.current = null
        setDisplayedSound(next)
        setPhase("opening")
        return
      }
      setDisplayedSound(null)
      setLayouts(null)
      setPhase("idle")
    }, PROXIMITY_VIDEO_TRANSITION_DURATION_MS)

    return () => {
      cancelled = true
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current)
        animationTimeoutRef.current = null
      }
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "opening" || !displayedSound || !mapRef.current) {
      return
    }

    let cancelled = false
    let layoutRaf: number | null = null
    let dockRaf: number | null = null
    let finishingRaf: number | null = null

    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    const scheduleLayout = () => {
      layoutRaf = requestAnimationFrame(() => {
        if (cancelled) {
          return
        }
        const map = mapRef.current
        if (!map) {
          scheduleLayout()
          return
        }
        const computed = buildLayouts(map, displayedSound, isPortraitMobile)
        if (!computed || cancelled) {
          scheduleLayout()
          return
        }

        setLayouts(computed)
        scheduleMicrotask(() => {
          if (cancelled) {
            return
          }
          setIsDocked(false)

          dockRaf = requestAnimationFrame(() => {
            if (cancelled) {
              return
            }
            finishingRaf = requestAnimationFrame(() => {
              if (cancelled) {
                return
              }
              setIsDocked(true)
              animationTimeoutRef.current = window.setTimeout(() => {
                animationTimeoutRef.current = null
                if (cancelled) {
                  return
                }
                setPhase("dock")
              }, PROXIMITY_VIDEO_TRANSITION_DURATION_MS)
            })
          })
        })
      })
    }

    scheduleLayout()

    return () => {
      cancelled = true
      if (layoutRaf !== null) {
        cancelAnimationFrame(layoutRaf)
      }
      if (dockRaf !== null) {
        cancelAnimationFrame(dockRaf)
      }
      if (finishingRaf !== null) {
        cancelAnimationFrame(finishingRaf)
      }
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current)
        animationTimeoutRef.current = null
      }
    }
  }, [phase, displayedSound, isPortraitMobile, mapRef])

  useEffect(() => {
    if (phase === "opening" || !displayedSound || !mapRef.current) {
      return
    }

    let cancelled = false
    const computed = buildLayouts(
      mapRef.current,
      displayedSound,
      isPortraitMobile,
    )
    if (computed) {
      scheduleMicrotask(() => {
        if (cancelled) {
          return
        }
        setLayouts(computed)
      })
    }
    return () => {
      cancelled = true
    }
  }, [phase, displayedSound, isPortraitMobile, mapRef])

  const scale = useMemo(() => {
    if (isPortraitMobile) {
      return isDocked ? 1 : MOBILE_PREVIEW_SCALE
    }
    return isDocked ? 1.12 : INITIAL_SCALE
  }, [isDocked, isPortraitMobile])

  if (!displayedSound || !layouts) {
    return null
  }

  const currentRect = isDocked ? layouts.dock : layouts.origin
  const proximityVideoStyle: CSSProperties = {
    width: `${currentRect.width}px`,
    height: `${currentRect.height}px`,
    transform: `translate3d(${currentRect.left}px, ${currentRect.top}px, 0) scale(${scale})`,
    opacity: isDocked ? 1 : 0.4,
    pointerEvents: isDocked ? "auto" : "none",
  }

  return (
    <ViewTransition name="proximity-video">
      <div className={proximityVideo} style={proximityVideoStyle}>
        <iframe
          title={`proximity preview: ${displayedSound.title}`}
          className={proximityVideoFrame}
          src={`https://www.youtube.com/embed/${displayedSound.videoSrc}?rel=0&autoplay=1&mute=1&playsinline=1`}
          allow="autoplay; encrypted-media"
        />
      </div>
    </ViewTransition>
  )
}
