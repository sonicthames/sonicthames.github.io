import {
  bodyContainer,
  hoverCard,
  closeButton as hoverCloseButton,
  description as hoverDescription,
  hoverHeader,
  title as hoverTitle,
  media,
  meta as metaSection,
  playButton,
} from "@ui/components/hover.css"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import type { Subject } from "rxjs"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"
import { H3 } from "../../components/Typography"
import type { Sound } from "../../domain/base"
import { showDateTime, showInterval } from "../../domain/base"
import { Icon } from "../../icon"
import { controlIconSize } from "../../theme/spacing"

interface Props {
  readonly sound: Sound
  readonly className?: string
  readonly close$: Subject<void>
  readonly play$: Subject<string>
}

export const Hover = ({ sound, close$, play$, className }: Props) => {
  return (
    <div className={cn(hoverCard, className)}>
      <header className={hoverHeader}>
        <button
          type="button"
          onClick={() => close$.next()}
          className={hoverCloseButton}
          aria-label="close"
        >
          <Icon name="Close" width={controlIconSize} height={controlIconSize} />
        </button>
      </header>
      <img
        alt={`${sound.title} thumbnail`}
        title={sound.title}
        className={media}
        src="/thumbnails/placeholder.jpeg"
      />
      <div className={bodyContainer}>
        <header>
          <Button
            tone="link"
            size="sm"
            fullWidth
            className={playButton}
            onClick={() => play$.next(sound.title)}
          >
            <H3 className={hoverTitle}>{sound.title}</H3>
            <Icon
              name="Play"
              width={controlIconSize}
              height={controlIconSize}
            />
          </Button>
        </header>
        <div className={hoverDescription}>
          {pipe(
            sound.description,
            RA.map((x) => <div key={x}>{x}</div>),
          )}
        </div>
        {"interval" in sound
          ? pipe(
              sound.interval,
              O.fold(constNull, (x) => (
                <div className={metaSection}>
                  <strong>Interval: </strong>
                  <span>{showInterval(x)}</span>
                </div>
              )),
            )
          : pipe(
              sound.dateTime,
              O.fold(constNull, (x) => (
                <div className={metaSection}>
                  <strong>Recorded date: </strong>
                  <span>{showDateTime(x)}</span>
                </div>
              )),
            )}
        {pipe(
          sound.location,
          O.fold(constNull, (location) => (
            <div className={metaSection}>
              <strong>Place: </strong>
              <span>{location}</span>
            </div>
          )),
        )}
      </div>
    </div>
  )
}
