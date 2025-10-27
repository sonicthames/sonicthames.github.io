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
    <div
      className={cn("shadow-md cursor-default pointer-events-auto", className)}
    >
      <header className="absolute top-0 right-0 left-0 p-2 flex items-center justify-end">
        <button
          type="button"
          onClick={() => close$.next()}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="close"
        >
          <Icon name="Close" width={controlIconSize} height={controlIconSize} />
        </button>
      </header>
      <img
        alt={`${sound.title} thumbnail`}
        title={sound.title}
        className="w-full h-[140px] border-none box-border"
        src="/thumbnails/placeholder.jpeg"
      />
      <div className="flex flex-col gap-2 p-4">
        <header>
          <Button
            variant="link"
            size="sm"
            className="w-full justify-start p-0 h-auto text-left"
            onClick={() => play$.next(sound.title)}
          >
            <H3 className="mr-2">{sound.title}</H3>
            <Icon
              name="Play"
              width={controlIconSize}
              height={controlIconSize}
            />
          </Button>
        </header>
        <div>
          {pipe(
            sound.description,
            RA.map((x) => <div key={x}>{x}</div>),
          )}
        </div>
        {"interval" in sound
          ? pipe(
              sound.interval,
              O.fold(constNull, (x) => (
                <div>
                  <strong>Interval: </strong>
                  <span>{showInterval(x)}</span>
                </div>
              )),
            )
          : pipe(
              sound.dateTime,
              O.fold(constNull, (x) => (
                <div>
                  <strong>Recorded date: </strong>
                  <span>{showDateTime(x)}</span>
                </div>
              )),
            )}
        {pipe(
          sound.location,
          O.fold(constNull, (location) => (
            <div>
              <strong>Place: </strong>
              <span>{location}</span>
            </div>
          )),
        )}
      </div>
    </div>
  )
}
