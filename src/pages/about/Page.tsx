import { css } from "@emotion/css";
import React from "react";
import { useDeviceType } from "../../theme/media";
import { spaceRem } from "../../theme/spacing";
import { Header } from "../common/Header";
import { makeCommonStyles } from "../styles";

interface Props {}

/**
 */
export const AboutPage = (_: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <Header />
      <main className={commonStyles.main}>
        <div className={styles.content}>
          <h1>About</h1>
          <div>Page doesn't exist yet!</div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  content: css({
    marginTop: spaceRem("xl"),
    gap: spaceRem("l"),
  }),
};
