import { css } from "@emotion/css";
import React from "react";
import { Link } from "react-router-dom";
import { fontSize } from "../../theme/fontSize";
import { maxPageSize, spaceRem } from "../../theme/spacing";

export const Header = () => (
  <header className={styles.component}>
    {/* <h1 className={css({ textAlign: "center" })}> */}
    {/* TODO Align with artwork and image */}
    <div className={styles.content}>
      <strong>Sonicthames</strong>
      <nav>
        <Link to="/main">Home</Link>
        <Link to="/sounds">Sounds</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </div>
  </header>
);

const styles = {
  component: css({
    position: "sticky",
    top: 0,
    backgroundColor: "rgba(255,255,255, 0.7)",
    fontSize: fontSize("l"),
    gap: spaceRem(),
    textTransform: "uppercase",
    nav: css({
      display: "flex",
      gap: spaceRem(),
    }),
    zIndex: 1,
  }),
  content: css({
    strong: css({
      flex: 1,
    }),
    display: "flex",
    justifyContent: "flex-end",
    gap: spaceRem(),
    padding: spaceRem(),
    margin: "0 auto",
    maxWidth: maxPageSize,
  }),
};
