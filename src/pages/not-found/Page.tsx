import { css } from "@emotion/css";
import React from "react";
import { Header } from "../common/Header";
import { commonStyles } from "../styles";

interface Props {}

/**
 */
export const NotFoundPage = (_: Props) => (
  <div className={styles.page}>
    <Header />
    <article className={styles.article}>
      <h1>Page not found!</h1>
    </article>
  </div>
);

const styles = {
  page: css({}),
  article: commonStyles.article,
};
