import { css } from "@emotion/css";
import { maxPageSize } from "../theme/spacing";

export const commonStyles = {
  page: css({}),
  article: css({
    margin: "0 auto",
    maxWidth: maxPageSize,
  }),
} as const;
