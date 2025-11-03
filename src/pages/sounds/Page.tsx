import { body, heading } from "@theme/recipes/text.css"
import {
  card,
  cardBody,
  cardDescription,
  cardLink,
  cardTitle,
  grid,
  iframe,
  media,
} from "@ui/components/sounds.css"
import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { Link } from "@/components/ui"
import { pageMain, pageMainVariants, pageRoot } from "@/ui/components/page.css"
import type { Category, Sound } from "../../domain/base"
import { R_CategoryFlavor } from "../../domain/base"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { soundId } from "../location"

interface Props {
  readonly category: Category
  readonly sounds: ReadonlyArray<Sound>
}

/**
 * This is the Sound's technical sheet
 */
export const SoundsPage = ({ category, sounds }: Props) => {
  const deviceType = useDeviceType()
  return (
    <div className={pageRoot}>
      <PageHeader />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <h1 className={heading.h1}>{category}</h1>
        <p className={body.muted}>
          <em>{R_CategoryFlavor[category]}</em>
        </p>
        <div>
          <ul className={grid}>
            {pipe(
              sounds,
              RA.mapWithIndex((_k, x) => (
                <li id={x.videoSrc} key={x.videoSrc}>
                  <div className={card}>
                    <div className={media}>
                      <iframe
                        title={x.title}
                        width="320"
                        height="240"
                        className={iframe}
                        src={`https://www.youtube.com/embed/${x.videoSrc}?rel=0`}
                      />
                    </div>
                    <div className={cardBody}>
                      <h3 className={cardTitle}>
                        <Link to={`/sound/${soundId(x)}`} className={cardLink}>
                          {x.title}
                        </Link>
                      </h3>
                      <div className={cardDescription}>
                        {pipe(
                          typeof x.description === "string"
                            ? [x.description]
                            : x.description,
                          RA.head,
                          O.fold(constNull, (y) => <p>{y}</p>),
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )),
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}
