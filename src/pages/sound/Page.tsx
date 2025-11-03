import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { pageMain, pageMainVariants, pageRoot } from "@/ui/components/page.css"
import {
  artworkArea,
  descriptionArea,
  soundArticle,
  soundHeader,
  soundHeading3,
  soundTitle,
  technicalDefinition,
  technicalList,
  technicalListItem,
  technicalSheetArea,
  technicalTerm,
  videoArea,
  videoIframe,
} from "@/ui/components/sound-page.css"
import type { Sound } from "../../domain/base"
import { showInterval } from "../../domain/base"
import { useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { constNA } from "../common/message"

interface Props {
  readonly sound: Sound
}

/**
 * This is the Sound's technical sheet
 */
export const SoundPage = ({ sound }: Props) => {
  const deviceType = useDeviceType()

  return (
    <div className={pageRoot}>
      <PageHeader />
      <main className={`${pageMain} ${pageMainVariants[deviceType]}`}>
        <header className={soundHeader}>
          <h1 className={soundTitle}>{sound.title}</h1>
        </header>
        <article className={soundArticle}>
          {/* TODO Make artwork smaller */}
          <div className={artworkArea}>
            <img
              src="/thumbnails/placeholder.jpeg"
              // src={sound.thumbnailSrc}
              width="400px"
              height="400px"
              alt="artwork"
            />
          </div>
          <div className={descriptionArea}>
            {pipe(
              sound.description,
              RA.map((x) => <p key={x}>{x}</p>),
            )}
          </div>
          <div className={technicalSheetArea}>
            <h3 className={soundHeading3}>Recording technical sheet</h3>
            <dl className={technicalList}>
              {pipe(
                "dateTime" in sound ? (
                  <>
                    <div className={technicalListItem}>
                      <dt className={technicalTerm}>Date:</dt>
                      <dd className={technicalDefinition}>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("dd MMMM yyyy")),
                        )}
                      </dd>
                    </div>

                    <div className={technicalListItem}>
                      <dt className={technicalTerm}>Time:</dt>
                      <dd className={technicalDefinition}>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("HH:mm")),
                        )}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className={technicalListItem}>
                    <dt className={technicalTerm}>Interval:</dt>
                    <dd className={technicalDefinition}>
                      {pipe(sound.interval, O.fold(constNA, showInterval))}
                    </dd>
                  </div>
                ),
              )}
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Place:</dt>
                <dd className={technicalDefinition}>
                  {pipe(sound.location, O.getOrElse(constNA))}
                </dd>
              </div>
              <div
                className={technicalListItem}
                title={`${sound.coordinates.lat},${sound.coordinates.lng}`}
              >
                <dt className={technicalTerm}>Map Location:</dt>
                <dd className={technicalDefinition}>
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
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Access:</dt>
                <dd className={technicalDefinition}>
                  {pipe(sound.access, O.getOrElse(constNA))}
                </dd>
              </div>
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Piece duration:</dt>
                <dd className={technicalDefinition}>
                  {sound.duration.toFormat("h:mm:ss")}
                </dd>
              </div>
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Weather:</dt>
                <dd className={technicalDefinition}>PLACEHOLDER</dd>
              </div>
            </dl>
          </div>
          <div className={videoArea}>
            {/* 426x240 */}
            <iframe
              title={sound.title}
              width="320"
              height="240"
              className={videoIframe}
              src={`https://www.youtube.com/embed/${sound.videoSrc}?rel=0`}
            />
          </div>
        </article>
      </main>
    </div>
  )
}
