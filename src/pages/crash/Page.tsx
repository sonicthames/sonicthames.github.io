import { css } from "@emotion/css";
import React from "react";
import { useDeviceType } from "../../theme/media";
import { spacingRem } from "../../theme/spacing";
import { makeCommonStyles } from "../styles";

interface Props {
  error: Error;
}

export const CrashPage = ({ error }: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <main className={commonStyles.main}>
        <div className={styles.content}>
          <h1>Opps! Something happened...</h1>
          <div>{error.message}</div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  content: css({
    marginTop: spacingRem("xl"),
  }),
};
