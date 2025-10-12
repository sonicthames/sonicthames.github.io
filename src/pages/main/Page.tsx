import React from "react";
import { useDeviceType } from "../../theme/media";
import { makeCommonStyles } from "../styles";

/**
 */
export const MainPage = (): JSX.Element => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <main />
    </div>
  );
};
