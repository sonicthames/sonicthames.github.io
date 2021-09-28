import { css } from "@emotion/css";
// import * as date from "date-fns";
// import { pipe } from "fp-ts/lib/function";
// import * as O from "fp-ts/Option";
// import * as RA from "fp-ts/ReadonlyArray";
// import * as RR from "fp-ts/ReadonlyRecord";
import { LoremIpsum } from "lorem-ipsum";
import React, { useState } from "react";
import { NewSound } from "../../domain/base";
import { useDeviceType } from "../../theme/media";
import { PageHeader } from "../common/Header";
import { makeCommonStyles } from "../styles";

interface Props {
  sound: NewSound;
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
            <div>{sound.description}</div>
            <div>
              <p>{lorem.generateSentences(5)}</p>
              <p>{lorem.generateSentences(4)}</p>
            </div>
          </div>
          <div className={styles.info}>
            <h3>Recording technical sheet</h3>
            <ul className={styles.details}>
              <li>
                <dt>Date:</dt>
                <dd>{sound.date}</dd>
                {/* <dd>{date.format(sound.date, "do MMMM yyyy")}</dd> */}
              </li>
              <li>
                <dt>Time:</dt>
                <dd>111000</dd>
              </li>
              <li>
                <dt>Place:</dt>
                <dd>Enbankment</dd>
              </li>
              <li>
                <dt>Map Location:</dt>
                <dd>{`${sound.coordinates.lat} lat, ${sound.coordinates.lng} lng`}</dd>
              </li>
              <li>
                <dt>Piece duration:</dt>
                <dd>111000</dd>
              </li>
              <li>
                <dt>Weather:</dt>
                <dd>111000</dd>
              </li>
            </ul>
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
    maxWidth: "1200px",
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

    li: css({
      display: "flex",
      "> :first-child": css({
        marginRight: 16,
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
