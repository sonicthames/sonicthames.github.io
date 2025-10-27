import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import type { Sound } from "../../domain/base"
import { showInterval } from "../../domain/base"
import { useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { constNA } from "../common/message"
import { makeCommonStyles } from "../styles"

interface Props {
  readonly sound: Sound
}

/**
 * This is the Sound's technical sheet
 */
export const SoundPage = ({ sound }: Props) => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)

  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main}>
        <header className="mb-4">
          <h1>{sound.title}</h1>
        </header>
        <article className="grid grid-cols-[repeat(5,1fr)] grid-rows-[auto_auto] gap-8 [grid-template-areas:'a_a_b_b_b'_'d_d_c_c_c'] [&_h2]:text-[rgb(90,112,6)] [&_h3]:text-[rgb(90,112,6)] [&_h1]:box-border [&_h1]:text-[rgb(90,112,6)] [&_h1]:font-[Helvetica_Neue,Helvetica,Roboto,Arial,sans-serif] [&_h1]:text-4xl [&_h1]:font-normal [&_dt]:font-bold [&_dt]:col-start-1 [&_dd]:m-0 [&_button]:inline-flex [&_button]:bg-[rgb(86,80,23)] [&_button]:text-white [&_button]:p-3 [&_button]:cursor-pointer [&_button]:uppercase">
          {/* TOOD Make artwork smaller */}
          <div className="[grid-area:a]">
            <img
              src="/thumbnails/placeholder.jpeg"
              // src={sound.thumbnailSrc}
              width="400px"
              height="400px"
              alt="artwork"
            />
          </div>
          <div className="[grid-area:b]">
            {pipe(
              sound.description,
              RA.map((x) => <p key={x}>{x}</p>),
            )}
          </div>
          <div className="[grid-area:c] border border-gray-600 p-4">
            <h3>Recording technical sheet</h3>
            <dl className="list-none m-0 mb-4 p-0 grid gap-3 grid-flow-row auto-rows-fr grid-cols-2 [&>div]:flex [&>div>:first-child]:mr-4 [&>div>:first-child]:basis-[25%] [&>div>:last-child]:mr-4 [&>div>:last-child]:basis-[70%]">
              {pipe(
                "dateTime" in sound ? (
                  <>
                    <div>
                      <dt>Date:</dt>
                      <dd>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("dd MMMM yyyy")),
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Time:</dt>
                      <dd>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("HH:mm")),
                        )}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt>Interval:</dt>
                    <dd>
                      {pipe(sound.interval, O.fold(constNA, showInterval))}
                    </dd>
                  </div>
                ),
              )}
              <div>
                <dt>Place:</dt>
                <dd>{pipe(sound.location, O.getOrElse(constNA))}</dd>
              </div>
              <div title={`${sound.coordinates.lat},${sound.coordinates.lng}`}>
                <dt>Map Location:</dt>
                <dd>
                  {pipe(
                    `${sound.coordinates.lat.toFixed(3)}, ${sound.coordinates.lng.toFixed(3)}`,
                    (message) =>
                      deviceType === "desktop" ? (
                        message
                      ) : (
                        <a
                          // TODO Test on mobile
                          // Show arrow that this opens a new link
                          href={`geo:${sound.coordinates.lat},${sound.coordinates.lng}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {message}
                        </a>
                      ),
                  )}
                </dd>
              </div>
              <div>
                <dt>Access:</dt>
                <dd>{pipe(sound.access, O.getOrElse(constNA))}</dd>
              </div>
              <div>
                <dt>Piece duration:</dt>
                <dd>{sound.duration.toFormat("h:mm:ss")}</dd>
              </div>
              <div>
                <dt>Weather:</dt>
                <dd>PLACEHOLDER</dd>
              </div>
            </dl>
          </div>
          <div className="[grid-area:d]">
            {/* 426x240 */}
            <iframe
              title={sound.title}
              width="320"
              height="240"
              style={{
                width: "100%",
                border: "none",
                boxSizing: "border-box",
              }}
              src={`https://www.youtube.com/embed/${sound.videoSrc}?rel=0`}
            />
          </div>
        </article>
      </main>
    </div>
  )
}
