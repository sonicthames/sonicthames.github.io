import { useState } from "react"
import {
  frame,
  playBackdrop,
  playBadge,
  playIcon,
  playRing,
  poster,
  posterImage,
} from "./VideoFacade.css"

interface Props {
  readonly videoId: string
  readonly title: string
  readonly className?: string
}

export const VideoFacade = ({ videoId, title, className }: Props) => {
  const [playing, setPlaying] = useState(false)
  return playing ? (
    <iframe
      title={title}
      className={`${frame} ${className ?? ""}`}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  ) : (
    <button
      type="button"
      className={`${poster} ${className ?? ""}`}
      aria-label={`Play ${title}`}
      onClick={() => setPlaying(true)}
    >
      <img
        className={posterImage}
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
      />
      <svg className={playBadge} viewBox="0 0 64 64" aria-hidden="true">
        <circle className={playBackdrop} cx="32" cy="32" r="31" />
        <circle className={playRing} cx="32" cy="32" r="30" />
        <path className={playIcon} d="M26 20 L46 32 L26 44 Z" />
      </svg>
    </button>
  )
}
