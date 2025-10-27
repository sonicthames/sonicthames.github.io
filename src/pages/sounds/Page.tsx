import { constNull, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import { Link } from "@/components/ui"
import type { Category, Sound } from "../../domain/base"
import { R_CategoryFlavor } from "../../domain/base"
import { useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { soundId } from "../location"
import { makeCommonStyles } from "../styles"

interface Props {
  readonly category: Category
  readonly sounds: ReadonlyArray<Sound>
}

/**
 * This is the Sound's technical sheet
 */
export const SoundsPage = ({ category, sounds }: Props) => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)
  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main} style={commonStyles.mainStyle}>
        <h1 className="text-3xl font-bold mt-6">{category}</h1>
        <p className={commonStyles.crest}>
          <em>{R_CategoryFlavor[category]}</em>
        </p>
        <div className="w-full">
          <ul className="list-none w-full m-0 p-0 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 box-border">
            {pipe(
              sounds,
              RA.mapWithIndex((_k, x) => (
                <li id={x.videoSrc} key={x.videoSrc}>
                  <div className="h-full rounded-xl border border-border bg-primary-light p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                    <div className="flex overflow-hidden rounded-md bg-black">
                      <iframe
                        title={x.title}
                        width="320"
                        height="240"
                        className="w-full border-none box-border"
                        src={`https://www.youtube.com/embed/${x.videoSrc}?rel=0`}
                      />
                    </div>
                    <div className="mt-4 mb-2 text-xl font-bold">
                      <Link
                        to={`/sound/${soundId(x)}`}
                        className="hover:underline"
                      >
                        {x.title}
                      </Link>
                    </div>
                    <div className="italic text-sm text-primary">
                      {pipe(
                        typeof x.description === "string"
                          ? [x.description]
                          : x.description,
                        RA.head,
                        O.fold(constNull, (y) => <p>{y}</p>),
                      )}
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
