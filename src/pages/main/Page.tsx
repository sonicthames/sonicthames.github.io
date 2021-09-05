import { css } from "@emotion/css";
import * as EQ from "fp-ts/Eq";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/String";
import React from "react";
import { sounds } from "../../data";
import { Sound } from "../../domain/base";
import { Header } from "../common/Header";
import { commonStyles } from "../styles";
import { Map } from "./Map";

const group = <A extends unknown>(S: EQ.Eq<A>) => {
  return RA.chop((as: ReadonlyArray<A>) => {
    const { init, rest } = pipe(
      as,
      RA.spanLeft((a: A) => S.equals(a, as[0]))
    );
    return [init, rest];
  });
};

const soundsByCategory = pipe(
  sounds,
  group(EQ.Contravariant.contramap<string, Sound>(S.Eq, (s) => s.category))
);

interface Props {}

/**
 * This is the Sound's technical sheet
 */
export const MainPage = (_: Props) => {
  return (
    <div className={styles.component}>
      <Header />
      <Map />
      <article className={styles.article}>
        <div className={styles.videos}>
          <ul className={styles.categoryList}>
            {pipe(
              soundsByCategory,
              RA.mapWithIndex((i, xs) =>
                pipe(
                  xs,
                  RA.head,
                  O.fold(constNull, (h) => (
                    <li className={styles.categoryItem(i % 2 === 0)}>
                      <h2>{h.category}</h2>
                      {/* TODO Round corners on thumbnail images / as Apple's icons */}
                      <ul className={styles.ul}>
                        {pipe(
                          xs,
                          RA.map((x) => (
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
                              <div className={styles.title}>{x.title}</div>
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
      </article>
    </div>
  );
};

const styles = {
  component: css({}),
  article: commonStyles.article,
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
    // backgroundColor: "green",
    display: "flex",
  }),
  videoIframe: css({
    width: "100%",
    border: "none",
    boxSizing: "border-box",
  }),
  title: css({
    // backgroundColor: "orange",
    marginBottom: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
  }),
  category: css({
    // backgroundColor: "purple",
    fontStyle: "italic",
    fontSize: "1.25rem",
  }),
  description: {
    // backgroundColor: "yellow",
    fontStyle: "italic",
  },
};
