import { css } from "@emotion/css";
import { pipe } from "fp-ts/lib/function";
// import * as date from "date-fns";
// import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
// import * as RR from "fp-ts/ReadonlyRecord";
import { LoremIpsum } from "lorem-ipsum";
import React, { useState } from "react";
import { Sound } from "../../domain/base";
import { maxPageWidth, useDeviceType } from "../../theme/media";
import { PageHeader } from "../common/Header";
import { constNA } from "../common/message";
import { makeCommonStyles } from "../styles";

interface Props {
  sound: Sound;
}

/**
 * This is the Sound's technical sheet
 */
export const SoundPage = ({ sound }: Props) => {
  const [lorem] = useState(
    () =>
      new LoremIpsum({
        sentencesPerParagraph: {
          max: 8,
          min: 4,
        },
        wordsPerSentence: {
          max: 16,
          min: 4,
        },
      })
  );

  lorem.generateWords(1);
  lorem.generateSentences(5);
  lorem.generateParagraphs(7);

  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);

  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main}>
        <header className={styles.header}>
          <h1>{sound.title}</h1>
        </header>
        <article className={styles.article}>
          {/* TOOD Make artwork smaller */}
          <div className={styles.artwork}>
            <img
              src="/thumbnails/placeholder.jpeg"
              // src={sound.thumbnailSrc}
              width="400px"
              height="400px"
              alt="artwork"
            />
          </div>
          <div className={styles.description}>
            <div>
              {pipe(
                sound.description,
                RA.map((x) => <p>{x}</p>)
              )}
            </div>
          </div>
          <div className={styles.info}>
            <h3>Recording technical sheet</h3>
            <dl className={styles.details}>
              {pipe(
                "dateTime" in sound ? (
                  <>
                    <div>
                      <dt>Date:</dt>
                      <dd>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("dd MMMM yyyy"))
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Time:</dt>
                      <dd>
                        {pipe(
                          sound.dateTime,
                          O.fold(constNA, (d) => d.toFormat("HH:mm"))
                        )}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt>Interval:</dt>
                    <dd>
                      {pipe(
                        sound.interval,
                        O.fold(
                          constNA,
                          (i) =>
                            // REVIEW Same day?
                            `${i.start.toFormat(
                              "dd MMMM yyyy"
                            )}, from ${i.start.toFormat(
                              "HH:mm"
                            )} to ${i.end.toFormat("HH:mm")}`
                        )
                      )}
                    </dd>
                  </div>
                )
              )}
              <div>
                <dt>Place:</dt>
                <dd>{pipe(sound.location, O.getOrElse(constNA))}</dd>
              </div>
              <div title={`${sound.coordinates.lat},${sound.coordinates.lng}`}>
                <dt>Map Location:</dt>
                <dd>
                  {pipe(
                    `${sound.coordinates.lat.toFixed(
                      3
                    )}, ${sound.coordinates.lng.toFixed(3)}`,
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
                      )
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
            {/* <div
              className={css({
                display: "flex",
              })}
            >
              <strong
                className={css({
                  marginRight: 16,
                })}
              >
                Microphones:
              </strong>
              <span>
                {pipe(
                  // Description with ticks
                  sound.microphones || {},
                  RR.filterMap((v) => (v === false ? O.none : O.some(v))),
                  RR.toReadonlyArray,
                  RA.map(([k, v]) =>
                    v === true
                      ? k
                      : `${k}${pipe(
                          v.subcategories ?? [],
                          (xs) => (typeof xs === "string" ? [xs] : xs),
                          RA.head,
                          O.fold(
                            () => "",
                            (x) => ` (${x})`
                          )
                        )}`
                  ),
                  (x) => x.join(", ")
                )}
              </span>
            </div> */}
          </div>
          <div className={styles.video}>
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
  );
};

const textColor = "rgb(90, 112, 6)";

const styles = {
  component: css({
    // backgroundColor: "rgba(237, 207, 121, 0.1)",
    margin: "0 auto",
    maxWidth: maxPageWidth,
  }),
  header: css({
    marginBottom: "16px",
  }),
  article: css({
    display: "grid",
    gridTemplate: `"a a b b b" "d d c c c"`,
    gap: "32px",
    h2: css({
      color: textColor,
    }),
    h3: css({
      color: textColor,
    }),
    h1: css({
      boxSizing: "border-box",
      color: textColor,
      fontFamily: `"Helvetica Neue", Helvetica, Roboto, Arial, sans-serif`,
      fontSize: "36px",
      fontWeight: 400,
      // height: 720px
      // line-height 24px
      // padding-bottom 80px
      // padding-left 0px
      // padding-right 0px
      // padding-top 80px
      // text-size-adjust 100%
      // width 1036px
      // -webkit-font-smoothing antialiased
    }),

    dt: css({
      fontWeight: "bold",
      // gridRowStart: 1,
      gridColumnStart: 1,
    }),
    dd: css({
      margin: 0,
    }),
    button: css({
      all: "unset",
      display: "inline-flex",
      backgroundColor: "rgb(86, 80, 23)",
      color: "white",
      padding: "12px",
      cursor: "pointer",
      textTransform: "uppercase",
    }),
  }),
  details: css({
    listStyle: "none",
    margin: 0,
    marginBottom: 16,
    padding: 0,
    // https://stackoverflow.com/questions/44134262/create-a-table-using-definition-list-and-grid-layout
    display: "grid",
    gap: "12px",
    gridAutoFlow: "row",
    /* doesn't assume 3 terms but N */
    gridAutoRows: "1fr",
    gridTemplateColumns: "1fr 1fr",
    "> div": css({
      display: "flex",
      "> :first-child": css({
        marginRight: 16,
        flexBasis: "25%",
      }),
      "> :last-child": css({
        marginRight: 16,
        flexBasis: "70%",
      }),
    }),

    // gridAutoFlow: "column",
    // /* doesn't assume 3 terms but N */
    // gridAutoColumns: "1fr",
    // gridTemplateRows: "repeat(50, min-content)",
    /* doesn't assume 3 defs but M<50 */
  }),
  artwork: css({
    gridArea: "a",
  }),
  video: css({
    gridArea: "d",
  }),

  description: css({
    gridArea: "b",
  }),
  info: css({
    gridArea: "c",
    border: "1px solid darkgrey",
    padding: "16px",
  }),
};
