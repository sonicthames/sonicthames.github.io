import {
  iconButton,
  playlist,
  playlistItem,
  playlistName,
} from "@ui/components/playlist.css"
import * as d3 from "d3-ease"
import { constFalse, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import type { Subject } from "rxjs"
import type { Sound } from "../../domain/base"
import { Icon } from "../../icon"
import type { Coordinate, GoTo } from "../../lib/map"

interface PlaylistItemProps {
  readonly name: string
  readonly goTo$: Subject<GoTo>
  readonly focused: boolean
  readonly play$: Subject<string>
  readonly coordinates: Coordinate
}

export const PlaylistItem = ({
  name,
  goTo$,
  play$,
  coordinates,
  focused = false,
}: PlaylistItemProps) => {
  return (
    <li className={playlistItem({ focused })}>
      <button
        type="button"
        onClick={() => play$.next(name)}
        className={iconButton}
        title="play"
      >
        <Icon name="Play" />
      </button>
      <span className={playlistName}>{name}</span>
      <button
        type="button"
        onClick={() =>
          goTo$.next({
            ...coordinates,
            zoom: 14,
            transitionDuration: 500,
            transitionEasing: d3.easeCubic,
          })
        }
        className={iconButton}
        aria-label="find in map"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label="GPS location icon"
        >
          <title>GPS location</title>
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
      </button>
    </li>
  )
}

interface PlaylistProps {
  readonly sounds: ReadonlyArray<Sound>
  readonly play$: Subject<string>
  readonly soundO: O.Option<Sound>
  readonly goTo$: Subject<GoTo>
}

export const Playlist = ({ goTo$, play$, soundO, sounds }: PlaylistProps) => {
  return (
    <div>
      <ul className={playlist}>
        {pipe(
          sounds,
          RA.map(({ title, coordinates }) => (
            <PlaylistItem
              key={title}
              goTo$={goTo$}
              focused={pipe(
                soundO,
                O.fold(constFalse, (s) => s.title === title),
              )}
              name={title}
              play$={play$}
              // TODO Rename lat lng
              coordinates={{
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              }}
            />
          )),
        )}
      </ul>
    </div>
  )
}
