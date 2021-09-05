import { css } from "@emotion/css";
import React from "react";
import { Header } from "../common/Header";

interface Props {
  error: Error;
}

/**
 */
export const CrashPage = ({ error }: Props) => (
  <div className={styles.component}>
    <Header />
    <article className={styles.article}>
      <h1>Opps! Something happened...</h1>
      <div>{error.message}</div>
    </article>
  </div>
);

const styles = {
  component: css({
    margin: "0 auto",
    maxWidth: "1200px",
  }),
  article: css({}),
};
