import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState, ViewTransition } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Sound } from "@/domain/sound"
import { cn } from "@/lib/utils"
import {
  headerButton,
  headerTitle,
  proximityVideo,
  proximityVideoFrame,
  theatreBackdrop,
  theatreBackdropVisible,
  theatreFooter,
  theatreFooterDescription,
  theatreFooterHeader,
  theatreFooterTitle,
  videoHeader,
} from "./ProximityVideo.css"
import { PROXIMITY_VIDEO_TRANSITION_DURATION_MS } from "./proximityVideoConstants"

const PLAYER_WIDTH = 320
const PLAYER_HEIGHT = 180
const PLAYER_ASPECT_RATIO = PLAYER_WIDTH / PLAYER_HEIGHT
const DOCK_MARGIN = 12
const ORIGIN_PREVIEW_SCALE = 0.01
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
  readonly theatre: Rect
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
    sound.coordinate.lng,
    sound.coordinate.lat,
  ])

  // Use full player dimensions for origin rect - scale will be applied via CSS transform
  const originWidth = PLAYER_WIDTH
  const originHeight = PLAYER_HEIGHT
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

  const computeTheatre = () => {
    const maxWidth = Math.max(DOCK_MARGIN, containerWidth - DOCK_MARGIN * 2)
    const maxHeight = Math.max(DOCK_MARGIN, containerHeight - DOCK_MARGIN * 2)
    let theatreWidth = Math.min(maxWidth, maxHeight * PLAYER_ASPECT_RATIO)
    let theatreHeight = theatreWidth / PLAYER_ASPECT_RATIO

    if (theatreHeight > maxHeight) {
      theatreHeight = maxHeight
      theatreWidth = theatreHeight * PLAYER_ASPECT_RATIO
    }

    const width = Math.max(PLAYER_WIDTH, theatreWidth)
    const height = Math.max(PLAYER_HEIGHT, theatreHeight)

    return {
      left: mapLeft + (containerWidth - width) / 2,
      top: mapTop + (containerHeight - height) / 2,
      width,
      height,
    }
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
      theatre: computeTheatre(),
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
    theatre: computeTheatre(),
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
  const [isTheatreMode, setIsTheatreMode] = useState(false)
  const isPortraitMobile = useIsPortraitMobile()
  const pendingSoundRef = useRef<Sound | null>(null)
  const animationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!sound) {
      setIsTheatreMode(false)
    }
  }, [sound])

  useEffect(() => {
    if (isPortraitMobile) {
      setIsTheatreMode(false)
    }
  }, [isPortraitMobile])

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

    setIsTheatreMode(false)
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

  const descriptionKeys = useMemo(() => {
    if (!displayedSound) {
      return []
    }

    const counters: Record<string, number> = {}
    return displayedSound.description.map((line) => {
      const count = counters[line] ?? 0
      counters[line] = count + 1
      return `${displayedSound.videoSrc}-${line}-${count}`
    })
  }, [displayedSound])

  const scale = useMemo(() => {
    if (isTheatreMode) {
      return 1
    }
    if (isPortraitMobile) {
      return isDocked ? 1 : MOBILE_PREVIEW_SCALE
    }
    return isDocked ? 1 : ORIGIN_PREVIEW_SCALE
  }, [isDocked, isPortraitMobile, isTheatreMode])

  if (!displayedSound || !layouts) {
    return null
  }

  const currentRect = isTheatreMode
    ? layouts.theatre
    : isDocked
      ? layouts.dock
      : layouts.origin
  const isInteractive = isTheatreMode || isDocked
  const proximityVideoStyle: CSSProperties = {
    width: `${currentRect.width}px`,
    height: `${currentRect.height}px`,
    transform: `translate3d(${currentRect.left}px, ${currentRect.top}px, 0) scale(${scale})`,
    opacity: isInteractive ? 1 : 0.4,
    pointerEvents: isInteractive ? "auto" : "none",
  }

  const params = new URLSearchParams({
    rel: "0",
    autoplay: "1",
    playsinline: "1",
    controls: "0",
    mute: "0",
    modestbranding: "1",
    fs: "0",
  })
  const videoSrc = `https://www.youtube.com/embed/${displayedSound.videoSrc}?${params.toString()}`

  const description = displayedSound.description

  return (
    <>
      {isTheatreMode && (
        <div
          className={cn(theatreBackdrop, theatreBackdropVisible)}
          aria-hidden
          onClick={() => setIsTheatreMode(false)}
        />
      )}
      <ViewTransition name="proximity-video">
        <div className={proximityVideo} style={proximityVideoStyle}>
          <iframe
            title={`proximity preview: ${displayedSound.title}`}
            className={proximityVideoFrame}
            src={videoSrc}
            allow="autoplay; encrypted-media"
          />
          <iframe
            title={`proximity preview: ${displayedSound.title}`}
            className={proximityVideoFrame}
            src={videoSrc}
            allow="autoplay; encrypted-media"
          />
          <div className={videoHeader}>
            <span className={headerTitle}>{displayedSound.title}</span>
            {!isTheatreMode && !isPortraitMobile && (
              <button
                type="button"
                className={headerButton}
                onClick={() => setIsTheatreMode(true)}
              >
                Theatre mode
              </button>
            )}
          </div>
          {isTheatreMode && (
            <div className={theatreFooter}>
              <div className={theatreFooterHeader}>
                <span className={theatreFooterTitle}>
                  {displayedSound.title}
                </span>
                <button
                  type="button"
                  className={headerButton}
                  onClick={() => setIsTheatreMode(false)}
                >
                  Exit theatre
                </button>
              </div>
              <div className={theatreFooterDescription}>
                {description.map((line, index) => (
                  <p key={descriptionKeys[index]}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </ViewTransition>
    </>
  )
}
