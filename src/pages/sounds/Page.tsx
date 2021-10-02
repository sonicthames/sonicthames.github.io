import { css } from "@emotion/css";
import { Link } from "@material-ui/core";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { NewCategory, NewSound, R_CategoryFlavor } from "../../domain/base";
import { useDeviceType } from "../../theme/media";
import { spaceRem } from "../../theme/spacing";
import { PageHeader } from "../common/Header";
import { makeCommonStyles } from "../styles";

interface Props {
  category: NewCategory;
  sounds: ReadonlyArray<NewSound>;
}

/**
 * This is the Sound's technical sheet
 */
export const SoundsPage = ({ category, sounds }: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main}>
        <h1>{category}</h1>
        <p className={commonStyles.crest}>
          <em>{R_CategoryFlavor[category]}</em>
        </p>
        <div className={styles.videos}>
          <ul className={styles.ul}>
            {pipe(
              sounds,
              // {/* TODO Round corners on thumbnail images / as Apple's icons */}
              RA.mapWithIndex((k, x) => (
                <li id={x.videoSrc} key={x.videoSrc}>
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
                    <Link
                      component={RouterLink}
                      underline="hover"
                      // TODO use my thing
                      to={`/sounds/${x.marker}`}
                    >
                      {x.title}
                    </Link>
                  </div>
                  <div>
                    <div className={styles.description}>
                      {pipe(
                        typeof x.description === "string"
                          ? [x.description]
                          : x.description,
                        RA.head,
                        O.fold(constNull, (x) => <p>{x}</p>)
                      )}
                    </div>
                  </div>
                </li>
              ))
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
  categoryItem: css({
    padding: 32,
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
  video: css({
    display: "flex",
    // TODO color
    backgroundColor: "black",
  }),
  videoIframe: css({
    width: "100%",
    border: "none",
    boxSizing: "border-box",
  }),
  title: css({
    marginTop: spaceRem("xxs"),
    marginBottom: spaceRem("xxs"),
    fontSize: "1.25rem",
    fontWeight: "bold",
  }),
  category: css({
    fontStyle: "italic",
    fontSize: "1.25rem",
  }),
  description: css({
    fontStyle: "italic",
  }),
};
