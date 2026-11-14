import { link } from "@theme/recipes/link.css"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { VideoFacade } from "@/components/VideoFacade"
import type { Sound } from "../../domain/sound"
import { showInterval } from "../../domain/sound"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { pageMain, pageMainVariants, pageRoot } from "../common/layout.css"
import { constNA } from "../common/message"
import {
  artworkImage,
  descriptionArea,
  mediaArea,
  sheetHeading,
  soundArticle,
  soundHeader,
  soundTitle,
  technicalDefinition,
  technicalList,
  technicalListItem,
  technicalSheetArea,
  technicalTerm,
} from "./Page.css"

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
      <PageHeader title={sound.title} />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <header className={soundHeader}>
          <h1 className={soundTitle}>{sound.title}</h1>
        </header>
        <article className={soundArticle}>
          <div className={mediaArea}>
            {pipe(
              sound.thumbnailSrc,
              O.fold(constNull, (src) => (
                <img
                  src={src}
                  width={400}
                  height={400}
                  alt={`Artwork for ${sound.title}`}
                  className={artworkImage}
                />
              )),
            )}
            <VideoFacade videoId={sound.videoSrc} title={sound.title} />
          </div>
          <div className={descriptionArea}>
            {pipe(
              sound.description,
              RA.filter((x) => x !== sound.title),
              RA.map((x) => (
                <p key={x}>
                  {/^https?:\/\/\S+$/.test(x) ? (
                    <a
                      className={link()}
                      href={x}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {x.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    x
                  )}
                </p>
              )),
            )}
          </div>
          <div className={technicalSheetArea}>
            <h2 className={sheetHeading}>Recording technical sheet</h2>
            <dl className={technicalList}>
              {pipe(
                "dateTime" in sound ? (
                  <>
                    <div className={technicalListItem}>
                      <dt className={technicalTerm}>Date</dt>
                      <dd className={technicalDefinition}>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("dd MMMM yyyy")),
                        )}
                      </dd>
                    </div>

                    <div className={technicalListItem}>
                      <dt className={technicalTerm}>Time</dt>
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
                    <dt className={technicalTerm}>Interval</dt>
                    <dd className={technicalDefinition}>
                      {pipe(sound.interval, O.fold(constNA, showInterval))}
                    </dd>
                  </div>
                ),
              )}
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Place</dt>
                <dd className={technicalDefinition}>
                  {pipe(sound.location, O.getOrElse(constNA))}
                </dd>
              </div>
              <div
                className={technicalListItem}
                title={`${sound.coordinate.lat},${sound.coordinate.lng}`}
              >
                <dt className={technicalTerm}>Map location</dt>
                <dd className={technicalDefinition}>
                  {pipe(
                    `${sound.coordinate.lat.toFixed(3)}, ${sound.coordinate.lng.toFixed(3)}`,
                    (message) =>
                      deviceType === "desktop" ? (
                        message
                      ) : (
                        <a
                          className={link()}
                          // TODO Test on mobile
                          // Show arrow that this opens a new link
                          href={`geo:${sound.coordinate.lat},${sound.coordinate.lng}`}
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
                <dt className={technicalTerm}>Access</dt>
                <dd className={technicalDefinition}>
                  {pipe(sound.access, O.getOrElse(constNA))}
                </dd>
              </div>
              <div className={technicalListItem}>
                <dt className={technicalTerm}>Piece duration</dt>
                <dd className={technicalDefinition}>
                  {sound.duration.toFormat("h:mm:ss")}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </main>
    </div>
  )
}
