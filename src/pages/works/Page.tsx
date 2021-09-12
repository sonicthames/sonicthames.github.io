import { css } from "@emotion/css";
import * as EQ from "fp-ts/Eq";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/String";
import React from "react";
import { Link } from "react-router-dom";
import { Sound } from "../../domain/base";
import { useDeviceType } from "../../theme/media";
import { makeCommonStyles } from "../styles";

const group = <A extends unknown>(S: EQ.Eq<A>) =>
  RA.chop((as: ReadonlyArray<A>) => {
    const { init, rest } = pipe(
      as,
      RA.spanLeft((a: A) => S.equals(a, as[0]))
    );
    return [init, rest];
  });

const byCategory = group(
  EQ.Contravariant.contramap<string, readonly [number, Sound]>(
    S.Eq,
    ([_, s]) => s.category
  )
);

interface Props {
  sounds: ReadonlyArray<Sound>;
}

/**
 * This is the Sound's technical sheet
 */
export const WorksPage = ({ sounds }: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <main className={commonStyles.main}>
        <div className={styles.videos}>
          <ul className={styles.categoryList}>
            {pipe(
              sounds,
              RA.mapWithIndex((k, v) => [k, v] as const),
              byCategory,
              RA.mapWithIndex((i, xs) =>
                pipe(
                  xs,
                  RA.head,
                  O.fold(constNull, ([, h]) => (
                    <li className={styles.categoryItem(i % 2 === 0)}>
                      <h2>{h.category}</h2>
                      {/* TODO Round corners on thumbnail images / as Apple's icons */}
                      <ul className={styles.ul}>
                        {pipe(
                          xs,
                          RA.map(([k, x]) => (
                            <li
                              id={x.videoSrc}
                              className={styles.li}
                              key={x.videoSrc}
                            >
                              <div className={styles.video}>
                                <iframe
                                  title={x.title}
                                  // 426x240
                                  width="320"
                                  height="240"
                                  className={styles.videoIframe}
                                  src={`https://www.youtube.com/embed/${x.videoSrc}?rel=0`}
                                />
                              </div>
                              <div className={styles.title}>
                                <Link to={`/work/${k}`}>{x.title}</Link>
                              </div>
                              <div>
                                <div style={styles.description}>
                                  {pipe(
                                    typeof x.description === "string"
                                      ? [x.description]
                                      : x.description,
                                    RA.map((x) => <p>{x}</p>)
                                  )}
                                </div>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </li>
                  ))
                )
              )
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

const styles = {
  component: css({}),
  videos: css({ width: "100%" }),
  categoryList: css({
    listStyle: "none",
    padding: 0,
  }),
  categoryItem: (isEven: boolean) =>
    css({
      padding: 32,
      ...(isEven
        ? {
            backgroundColor: "white",
          }
        : {}),
    }),
  // 16x9
  // 426x240
  ul: css({
    listStyle: "none",
    width: "100%",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: "32px 32px",
    gridTemplateColumns: "1fr",
    boxSizing: "border-box",
    "@media (min-width: 600px)": {
      gridTemplateColumns: "1fr 1fr",
    },
    "@media (min-width: 900px)": {
      gridTemplateColumns: "1fr 1fr 1fr",
    },
  }),
  li: css({}),
  video: css({
    display: "flex",
  }),
  videoIframe: css({
    width: "100%",
    border: "none",
    boxSizing: "border-box",
  }),
  title: css({
    marginBottom: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
  }),
  category: css({
    fontStyle: "italic",
    fontSize: "1.25rem",
  }),
  description: {
    fontStyle: "italic",
  },
};
