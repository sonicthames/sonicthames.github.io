import { css } from "@emotion/css";
import React from "react";
import { Header } from "../common/Header";
import { commonStyles } from "../styles";

interface Props {}

/**
 */
export const NotFoundPage = ({}: Props) => (
  <div className={styles.component}>
    <Header />
    <article className={styles.article}>
      <h1>Page not found!</h1>
    </article>
  </div>
);

const styles = {
  component: css({
    margin: "0 auto",
    maxWidth: "1200px",
  }),
  article: commonStyles.article,
};
