import { css } from "@emotion/css";
import React from "react";
import { useDeviceType } from "../../theme/media";
import { spaceRem } from "../../theme/spacing";
import { Header } from "../common/Header";
import { makeCommonStyles } from "../styles";

interface Props {}

/**
 */
export const NotFoundPage = (_: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <Header />
      <main className={commonStyles.main}>
        <div className={styles.content}>
          <h1>Page not found!</h1>
        </div>
      </main>
    </div>
  );
};

const styles = {
  content: css({
    marginTop: spaceRem("xl"),
  }),
};
